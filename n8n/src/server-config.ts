import path from 'path';
import { getEnvValueOrFail } from './env-utils';
import { IServerConfig } from './types';

let serverConfig: IServerConfig;

export const getServerConfig = (): IServerConfig => {
  if (!serverConfig) {
    serverConfig = {
      engineFolder: path.join(__dirname, '../sp-webssh'),
      privateKeyFilePath: `${__dirname}/private.pem`,
      certificateFilePath: `${__dirname}/certificate.crt`,
      port: Number.parseInt(getEnvValueOrFail('HTTPS_PORT')),
      tlsKey: getEnvValueOrFail('TLS_KEY'),
      tlsCert: getEnvValueOrFail('TLS_CERT'),
    };
  }

  return serverConfig;
};
