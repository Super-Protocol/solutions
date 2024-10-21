import { access, constants, readFile } from 'fs/promises';
import { Logger } from 'pino';
import get from 'lodash.get';
import { EngineConfiguration } from './types';
import { DomainConfig } from '@super-protocol/tunnels-lib';
import { CryptoAlgorithm, Encoding, EncryptionKey } from '@super-protocol/dto-js';
import { getOrderResult, parseTunnelProvisionerOrderResult } from './order-helpers';

const DEFAULT_CONFIURATION_PATH = '/sp/configurations/configuration.json';
const DEFAULT_TUNNEL_CLIENT_JSON_PATH = 'solution.engine.tunnel_client';

type TunnelInfo = {
  mrSigner: string;
  mrEnclave: string;
};

type FindConfigInConfigurationParams = {
  configurationPath?: string;
  tunnelClientJsonPath?: string;
  logger: Logger;
} & TunnelInfo;

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

export const findConfigInConfiguration = async (
  params: FindConfigInConfigurationParams,
): Promise<DomainConfig | undefined> => {
  const configurationPath = params.configurationPath || DEFAULT_CONFIURATION_PATH;
  const tunnelClientJsonPath = params.tunnelClientJsonPath || DEFAULT_TUNNEL_CLIENT_JSON_PATH;
  const { mrSigner, mrEnclave, logger } = params;

  if (!(await fileExists(configurationPath))) {
    return;
  }

  const configuration = JSON.parse(await readFile(configurationPath, { encoding: 'utf8' }));
  const tunnelClientConfig = get(configuration, tunnelClientJsonPath) as
    | EngineConfiguration['tunnel_client']
    | undefined;
  if (!tunnelClientConfig) {
    return;
  }

  const tunnels = [
    {
      sgxMrSigner: mrSigner,
      sgxMrEnclave: mrEnclave,
    },
  ];

  if (tunnelClientConfig.provision_type.toLowerCase().includes('manual')) {
    logger.info('Loading manual configuration...');

    const manualSettings = tunnelClientConfig.manual_domain_settings;

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

  const { order_id: orderId, order_key } = tunnelClientConfig.tunnel_provisioner_order;
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
