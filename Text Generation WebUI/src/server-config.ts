import path from 'path';
import { config } from './config';
import { getEnvValueOrFail } from './env-utils';

export interface IServerConfig {
  engineFolder: string;
  privateKeyFilePath: string;
  certificateFilePath: string;
  port: number;
  tlsKey: string;
  tlsCert: string;
  modelSizeThreshold: number;
  configurationPath: string;
}

let serverConfig: IServerConfig;

export const getServerConfig = (): IServerConfig => {
  if (!serverConfig) {
    serverConfig = {
      engineFolder: path.join(__dirname, '../text-generation-webui'),
      privateKeyFilePath: `${__dirname}/private.pem`,
      certificateFilePath: `${__dirname}/certificate.crt`,
      port: Number.parseInt(getEnvValueOrFail('HTTPS_PORT')),
      tlsKey: getEnvValueOrFail('TLS_KEY'),
      tlsCert: getEnvValueOrFail('TLS_CERT'),
      modelSizeThreshold: 100 * 1024 * 1024, // 100Mb
      configurationPath: config.configurationPath,
    };
  }

  return serverConfig;
};
