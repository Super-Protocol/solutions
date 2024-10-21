import dotenv from 'dotenv';
import path from 'path';
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
  configFileName: 'tunnel-client-config.json',
  configSearchFolderDepth: 1 as number,
  clientServerPort: 9000,
  serverFilePath: path.join(__dirname, './server.js'),
  mrEnclave: getEnvValueOrFail('MRENCLAVE'),
  mrSigner: getEnvValueOrFail('MRSIGNER'),
  configurationPath: process.env.CONFIGURATION_PATH || '/sp/configurations/configuration.json',
};
