import path from 'path';
import dotenv from 'dotenv';
import packageJson from '../package.json';

dotenv.config();

const getEnvValueOrFail = (envKey: string): string => {
  const value = process.env[envKey];

  if (!value) {
    throw new Error(`ENV value for ${envKey} is missing`);
  }

  return value;
};

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
};
