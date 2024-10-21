import { CryptoAlgorithm, Encoding, EncryptionKey } from '@super-protocol/dto-js';
import { DomainConfig } from '@super-protocol/tunnels-lib';
import { Logger } from 'pino';
import { getOrderResult, parseTunnelProvisionerOrderResult } from '../order-helpers';
import { EngineConfiguration } from '../types';

type TunnelInfo = {
  mrSigner: string;
  mrEnclave: string;
};

type GetDomainConfigParams = {
  configuration: EngineConfiguration['tunnel_client'];
  logger: Logger;
} & TunnelInfo;

export const getDomainConfig = async (
  params: GetDomainConfigParams,
): Promise<DomainConfig | undefined> => {
  const { configuration, mrSigner, mrEnclave, logger } = params;

  const tunnels = [
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
      /**
       * Private key and SSL certificate of the domain in PEM format as Buffers
       */
      site: {
        /**
         * Domain (required for wildcard certificates). If not provided, it will be extracted from certificate
         */
        domain: manualSettings.domain || '',
        /**
         * SSL certificate buffer
         */
        cert: Buffer.from(manualSettings.tls_certifiacate, 'utf-8'),
        /**
         * Private key for SSL certificate
         */
        key: Buffer.from(manualSettings.tls_key, 'utf-8'),
      },
      quotes: [],
    };
  }
  logger.info('Loading configuration from Tunnels Launcher order...');

  const { order_id: orderId, order_key } = configuration.tunnel_provisioner_order;
  const orderKey: EncryptionKey = {
    algo: CryptoAlgorithm.ECIES,
    encoding: Encoding.base64,
    key: order_key,
  };

  logger.info('Download and decrypt order result');
  const orderResult = await getOrderResult({ orderId, orderKey });

  logger.info('Parse order result');
  const tunnelConfig = await parseTunnelProvisionerOrderResult(orderResult);

  return {
    tunnels,
    authToken: tunnelConfig.authToken,
    site: {
      domain: tunnelConfig.domain,
      cert: Buffer.from(tunnelConfig.cert, 'utf-8'),
      key: Buffer.from(tunnelConfig.certPrimaryKey, 'utf-8'),
    },
    quotes: [tunnelConfig.certQuote],
  };
};
