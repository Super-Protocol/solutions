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
  RIGenerator,
  getStorageProvider,
} from '@super-protocol/sdk-js';
import fs from 'fs';
import { PassThrough, Readable } from 'stream';
import tar from 'tar-stream';
import zlib from 'zlib';
import { config } from './config';
import { TunnelProvisionerOrderResult } from './types';

export type DownloadOrderResultParams = {
  orderId: string;
  orderKey: string;
};

type EncryptedOrderResult = { resource: Encryption; encryption: Encryption };

const getEncryptionKey = (orderKey: string): EncryptionKey => {
  try {
    return JSON.parse(orderKey) as EncryptionKey;
  } catch (err) {
    throw new Error('Could not parse order key: ' + (err as Error).message);
  }
};

const getOrderEncryptedResult = async (orderId: string): Promise<EncryptedOrderResult> => {
  const connector = BlockchainConnector.getInstance();

  await connector.initialize({
    blockchainUrl: config.blockchainUrl,
    contractAddress: config.blockchainContractAddress,
  });

  const order = new Order(orderId);
  const { encryptedResult } = await order.getOrderResult();

  connector.shutdown();

  return JSON.parse(encryptedResult) as EncryptedOrderResult;
};

const decryptOrderResult = async (params: {
  encryptedResult: EncryptedOrderResult;
  orderKey: string;
}): Promise<{ resource: StorageProviderResource; encryption: Encryption }> => {
  const { encryptedResult, orderKey } = params;
  const encryptionKey = getEncryptionKey(orderKey);

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
  const encryptedResult = await getOrderEncryptedResult(params.orderId);
  const decryptedResult = await decryptOrderResult({
    encryptedResult,
    orderKey: params.orderKey,
  });

  if (decryptedResult.resource.type !== ResourceType.StorageProvider) {
    throw new Error(`Invalid resource type (resourceType=${decryptedResult?.resource?.type})`);
  }

  const storageProvider = getStorageProvider(decryptedResult.resource);
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