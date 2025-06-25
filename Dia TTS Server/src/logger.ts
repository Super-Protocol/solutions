import pino from 'pino';
import { config } from './config';

const pinoConfig = { level: config.logLevel };

export const rootLogger = pino(pinoConfig).child({
  app: config.appName,
  version: config.appVersion,
});
