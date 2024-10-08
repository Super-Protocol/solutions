import path from 'path';
import { getEnvValeOrFail } from './utils';

export const serverConfig = {
  engineFolder: path.join(__dirname, '../text-generation-webui'),
  privateKeyFilePath: `${__dirname}/private.pem`,
  certificateFilePath: `${__dirname}/certificate.crt`,
  port: getEnvValeOrFail('HTTPS_PORT') as number,
  tlsKey: getEnvValeOrFail('TLS_KEY') as string,
  tlsCert: getEnvValeOrFail('TLS_CERT') as string,
  modelSizeThreshold: 100 * 1024 * 1024, // 100Mb,
  configurationPath: process.env.CONFIGURATION_PATH || '/sp/configurations/configuration.json',
};
