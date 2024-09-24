import path from 'path';
import dotenv from 'dotenv';
import packageJson from '../package.json';

dotenv.config();

const getEnvValeOrFail = (envName: string): keyof typeof process.env => {
  const value = process.env[envName];
  if (!value) {
    throw new Error(`Env value ${envName} is missing`);
  }

  return value;
};

export const config = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  logLevel: process.env.LOG_LEVEL as string | 'trace',
  inputDataFolder: process.env.INPUT_DATA_FOLDER as string | '/sp/inputs',
  configFileName: 'tunnel-client-config.json',
  configSearchFolderDepth: 1 as number,
  clientServerPort: 9000,
  serverFilePath: path.join(__dirname, './sever.js'),
};

export const serverConfig = {
  engineFolder: path.join(__dirname, '../text-generation-webui'),
  privateKeyFilePath: `${__dirname}/private.pem`,
  certificateFilePath: `${__dirname}/certificate.crt`,
  port: process.env.HTTPS_PORT || 9000,
  tlsKey: getEnvValeOrFail('TLS_KEY') as string,
  tlsCert: getEnvValeOrFail('TLS_CERT') as string,
  modelSizeThreshold: 100 * 1024 * 1024, // 100Mb
};
