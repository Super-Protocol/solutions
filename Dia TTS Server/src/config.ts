import * as dotenv from 'dotenv';
import * as path from 'path';
import * as packageJson from '../package.json';
import { getEnvValueOrFail } from './env-utils';

dotenv.config();

export const config = {
  appName: packageJson.name,
  appVersion: packageJson.version,
  logLevel: (process.env.LOG_LEVEL as string) || 'info',
  certFileName: (process.env.CERT_FILE_NAME as string) || 'certificate.crt',
  certPrivateKeyFileName: (process.env.CERT_PRIVATE_KEY_FILE_NAME as string) || 'private.pem',
  clientServerPort: 8003,
  serverFilePath: path.join(__dirname, './server.js'),
};
