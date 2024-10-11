import path from 'path';
import dotenv from 'dotenv';
import packageJson from '../package.json';

dotenv.config();

export const config = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  logLevel: (process.env.LOG_LEVEL as string) || 'trace',
  inputDataFolder: (process.env.INPUT_DATA_FOLDER as string) || '/sp/inputs',
  configFileName: 'tunnel-client-config.json',
  configSearchFolderDepth: 1 as number,
  clientServerPort: 9000,
  serverFilePath: path.join(__dirname, './server.js'),
};
