import {
  Encryption,
  EncryptionKey,
  ResourceType,
  StorageProviderResource,
} from '@super-protocol/dto-js';
import {
  BlockchainConnector,
  Crypto,
  Order,
  OrderStatus,
  RIGenerator,
  getStorageProvider,
  helpers,
} from '@super-protocol/sdk-js';
import fs from 'fs';
import { Logger } from 'pino';
import { PassThrough, Readable } from 'stream';
import tar from 'tar-stream';
import zlib from 'zlib';
import { TunnelProvisionerOrderResult } from './types';

export type DownloadOrderResultParams = {
  orderId: string;
  orderKey: EncryptionKey;
  blockchainUrl: string;
  contractAddress: string;
  logger: Logger;
};

type EncryptedOrderResult = { resource: Encryption; encryption: Encryption };

const isOrderFinished = async (orderId: string): Promise<boolean> => {
  const order = new Order(orderId);

  if (!(await order.isExist())) {
    throw new Error(`Order does not exist (orderId=${orderId})`);
  }

  const orderInfo = await order.getOrderInfo();

  const finishStatuses = [OrderStatus.Done, OrderStatus.Error, OrderStatus.Canceled];

  return finishStatuses.includes(orderInfo.status);
};

const getOrderEncryptedResult = async (params: {
  orderId: string;
  blockchainUrl: string;
  contractAddress: string;
  logger: Logger;
}): Promise<EncryptedOrderResult> => {
  const { orderId, blockchainUrl, contractAddress, logger } = params;

  logger.debug('Getting order encrypted result');
  const connector = BlockchainConnector.getInstance();

  try {
    await connector.initialize({
      blockchainUrl,
      contractAddress,
    });

    const retryIntervalInSeconds = 10;
    await helpers.tryWithInterval({
      handler() {
        logger.debug('Checking if order is finished');
        return isOrderFinished(orderId);
      },
      checkResult: (isResultOk) => ({ isResultOk }),
      retryInterval: retryIntervalInSeconds * 1000,
      retryMax: (60 * 60 * 3) / retryIntervalInSeconds,
    });

    const order = new Order(orderId);
    const orderInfo = await order.getOrderInfo();

    if (orderInfo.status === OrderStatus.Canceled) {
      throw new Error(`Tunnel Provisioner Order is canceled (orderId=${orderId})`);
    }
    if (orderInfo.status === OrderStatus.Error) {
      throw new Error(`Tunnel Provisioner Order failed (orderId=${orderId})`);
    }

    const { encryptedResult } = await order.getOrderResult();

    logger.debug('Order encrypted result received');

    return JSON.parse(encryptedResult) as EncryptedOrderResult;
  } finally {
    connector.shutdown();
  }
};

const decryptOrderResult = async (params: {
  encryptedResult: EncryptedOrderResult;
  orderKey: EncryptionKey;
}): Promise<{ resource: StorageProviderResource; encryption: Encryption }> => {
  const { encryptedResult, orderKey: encryptionKey } = params;

  const publicKeyEncryption = Crypto.getPublicKey(encryptionKey);
  const derivedPrivateKey = await RIGenerator.getDerivedPrivateKey(publicKeyEncryption);

  const decryptedResourceStr = await tryDecryptWithKeys(encryptedResult.resource, [
    encryptionKey.key,
    derivedPrivateKey.key,
  ]);
  if (!decryptedResourceStr) {
    throw new Error('Could not decrypt resource');
  }

  const decryptedEncryptionStr = await tryDecryptWithKeys(encryptedResult.encryption, [
    encryptionKey.key,
    derivedPrivateKey.key,
  ]);
  if (!decryptedEncryptionStr) {
    throw new Error('Could not decrypt encryption');
  }

  return {
    resource: JSON.parse(decryptedResourceStr) as StorageProviderResource,
    encryption: JSON.parse(decryptedEncryptionStr) as Encryption,
  };
};

const tryDecryptWithKeys = async (
  encryption: Encryption,
  decryptionKeys: string[],
): Promise<string | undefined> => {
  for (const decryptionKey of decryptionKeys) {
    try {
      return await Crypto.decrypt({
        ...encryption,
        key: decryptionKey,
      });
    } catch (e) {
      continue;
    }
  }
};

export const getOrderResult = async (params: DownloadOrderResultParams): Promise<Readable> => {
  const { orderId, orderKey } = params;
  const logger = params.logger.child({ orderId });

  logger.info('Getting order result');
  const encryptedResult = await getOrderEncryptedResult({
    orderId,
    blockchainUrl: params.blockchainUrl,
    contractAddress: params.contractAddress,
    logger,
  });

  logger.info('Decrypting order result');
  const decryptedResult = await decryptOrderResult({
    encryptedResult,
    orderKey,
  });

  if (decryptedResult.resource.type !== ResourceType.StorageProvider) {
    throw new Error(`Invalid resource type (resourceType=${decryptedResult?.resource?.type})`);
  }

  const storageProvider = getStorageProvider(decryptedResult.resource);

  logger.info('Downloading order result file');
  const downloadStream = await storageProvider.downloadFile(decryptedResult.resource.filepath, {});
  const outputStream = new PassThrough();

  await Crypto.decryptStream(
    downloadStream as fs.ReadStream,
    outputStream as unknown as fs.WriteStream,
    decryptedResult.encryption,
  );

  return outputStream;
};

export const parseTunnelProvisionerOrderResult = async (
  orderResult: Readable,
): Promise<TunnelProvisionerOrderResult> => {
  const gunzip = zlib.createGunzip();
  const extract = tar.extract();

  let resultJsonContent = '';

  orderResult.pipe(gunzip).pipe(extract);

  let fileContent = '';

  for await (const entry of extract) {
    if (entry.header.name === 'output/result.json' && entry.header.type === 'file') {
      for await (const chunk of entry) {
        fileContent += chunk.toString();
      }
      resultJsonContent = fileContent;
    } else {
      entry.resume();
    }
  }

  if (!fileContent) {
    throw new Error('Could not find result.json in order result');
  }

  return JSON.parse(resultJsonContent);
};
