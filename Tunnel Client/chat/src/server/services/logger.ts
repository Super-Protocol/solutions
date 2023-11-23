import pino, { Logger as LoggerType } from 'pino';

const logger = pino();

export type Logger = LoggerType;

export default logger;