import path from 'path';
import dotenv from 'dotenv';
import packageJson from '../package.json';
import { getEnvValueOrFail } from './env-utils';

dotenv.config();

export const config = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  blockchainUrl: getEnvValueOrFail('BLOCKCHAIN_URL'),
  blockchainContractAddress: getEnvValueOrFail('BLOCKCHAIN_CONTRACT_ADDRESS'),
  logLevel: (process.env.LOG_LEVEL as string) || 'trace',
  inputDataFolder: (process.env.INPUT_DATA_FOLDER as string) || '/sp/inputs',
  clientServerPort: 9000,
  serverFilePath: path.join(__dirname, './server.js'),
  configurationPath: process.env.CONFIGURATION_PATH || '/sp/configurations/configuration.json',
  localServerStartTimeoutMs: Number.parseInt(process.env.LOCAL_SERVER_START_TIMEOUT_MS || '300000'), // 5 min
};
