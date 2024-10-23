import { CryptoAlgorithm, Encoding, EncryptionKey } from '@super-protocol/dto-js';
import { DomainConfig } from '@super-protocol/tunnels-lib';
import { Logger } from 'pino';
import { getOrderResult, parseTunnelProvisionerOrderResult } from '../order-helpers';
import { EngineConfiguration } from '../types';

type TunnelInfo = {
  mrSigner: string;
  mrEnclave: string;
};

type GetCertFilesFn = () => Promise<{
  fullchainPem: string;
  privateKeyPem: string;
}>;

type GetDomainConfigParams = {
  configuration: EngineConfiguration['tunnel_client'];
  getCertFiles?: GetCertFilesFn;
  logger: Logger;
} & TunnelInfo;

export const getDomainConfig = async (params: GetDomainConfigParams): Promise<DomainConfig> => {
  const { configuration, mrSigner, mrEnclave, logger, getCertFiles } = params;

  const tunnels = [
    {
      sgxMrSigner: '000102030405060708090a0b0c0d0f000102030405060708090a0b0c0d0f0102',
      sgxMrEnclave: '000102030405060708090a0b0c0d0f000102030405060708090a0b0c0d0f0102',
    },
    {
      sgxMrSigner: mrSigner,
      sgxMrEnclave: mrEnclave,
    },
  ];

  if (configuration.provision_type.toLowerCase().includes('manual')) {
    logger.info('Loading manual configuration...');

    const manualSettings = configuration.manual_domain_settings;

    return {
      tunnels,
      authToken: manualSettings.auth_token,
      site: {
        domain: manualSettings.domain || '',
        cert: Buffer.from(manualSettings.tls_certifiacate, 'utf-8'),
        key: Buffer.from(manualSettings.tls_key, 'utf-8'),
      },
      quotes: [],
    };
  }

  if (!getCertFiles) {
    throw new Error('No getCertFiles function provided');
  }

  logger.info('Loading configuration from Tunnels Launcher order...');

  const { order_id: orderId, order_key } = configuration.tunnel_provisioner_order;
  const orderKey: EncryptionKey = {
    algo: CryptoAlgorithm.ECIES,
    encoding: Encoding.base64,
    key: order_key,
  };

  logger.info('Download and decrypt order result');
  const orderResult = await getOrderResult({ orderId, orderKey, logger });

  logger.info('Parse order result');
  const tunnelConfig = await parseTunnelProvisionerOrderResult(orderResult);

  const cert = await getCertFiles();

  return {
    tunnels,
    authToken: tunnelConfig.authToken,
    site: {
      domain: tunnelConfig.domain,
      cert: Buffer.from(cert.fullchainPem, 'utf-8'),
      key: Buffer.from(cert.privateKeyPem, 'utf-8'),
    },
    quotes: [tunnelConfig.certQuote],
  };
};
