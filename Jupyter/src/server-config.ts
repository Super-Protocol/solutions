import * as path from 'path';
import { config } from './config';
import { getEnvValueOrFail } from './env-utils';
import { IServerConfig } from './types';

let serverConfig: IServerConfig;

export const getServerConfig = (): IServerConfig => {
  if (!serverConfig) {
    serverConfig = {
      privateKeyFilePath: path.join(__dirname, config.certPrivateKeyFileName),
      certificateFilePath: path.join(__dirname, config.certFileName),
      port: Number.parseInt(getEnvValueOrFail('HTTPS_PORT')),
      tlsKey: getEnvValueOrFail('TLS_KEY'),
      tlsCert: getEnvValueOrFail('TLS_CERT'),
    };
  }

  return serverConfig;
};
