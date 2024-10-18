import path from 'path';
import { getEnvValueOrFail } from './utils';

export const serverConfig = {
  engineFolder: path.join(__dirname, '../text-generation-webui'),
  privateKeyFilePath: `${__dirname}/private.pem`,
  certificateFilePath: `${__dirname}/certificate.crt`,
  port: Number.parseInt(getEnvValueOrFail('HTTPS_PORT')),
  tlsKey: getEnvValueOrFail('TLS_KEY'),
  tlsCert: getEnvValueOrFail('TLS_CERT'),
  modelSizeThreshold: 100 * 1024 * 1024, // 100Mb,
  configurationPath: process.env.CONFIGURATION_PATH || '/sp/configurations/configuration.json',
};
