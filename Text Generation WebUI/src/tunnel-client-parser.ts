import { DomainConfig } from '@super-protocol/tunnels-lib';
import { rootLogger } from './logger';
import { CryptoAlgorithm, Encoding, EncryptionKey } from '@super-protocol/dto-js';
import { getOrderResult, parseTunnelProvisionerOrderResult } from './order-helpers';
import { config } from './config';
import { readConfiguration } from './read-configuration';
import { EngineConfiguration } from './types';

export class TunnelCllientParser {
    private logger = rootLogger.child({
        module: TunnelCllientParser.name,
      });

  async getTunnelClientConfig(): Promise<DomainConfig> {
    const configuration = await readConfiguration(config.configurationPath);
    if (!configuration) {
      throw new Error('Configuration not found');
    }

    const tunnelClientConfig = (configuration.solution.engine as EngineConfiguration).tunnel_client;
    const tunnels = [
      {
        sgxMrSigner: config.mrSigner,
        sgxMrEnclave: config.mrEnclave,
      },
    ];

    if (tunnelClientConfig.provision_type.toLowerCase().includes('manual')) {
      this.logger.info('Loading manual configuration...');

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
    this.logger.info('Loading configuration from Tunnels Launcher order...');

    const { order_id: orderId, order_key } = tunnelClientConfig.tunnel_provisioner_order;
    const orderKey: EncryptionKey = {
      algo: CryptoAlgorithm.ECIES,
      encoding: Encoding.base64,
      key: order_key,
    };

    this.logger.info('Download and decrypt order result');
    const orderResult = await getOrderResult({ orderId, orderKey });

    this.logger.info('Parse order result');
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
  }

}
