import pino from 'pino';
import { IBindings, ILogger, ILoggerOptions } from './types';
import { name, version } from '../../package.json';

export interface ICreateLoggerParams {
  options: Partial<ILoggerOptions>;
  parentLogger: ILogger;
  bindings: IBindings;
}
export const createLogger = (params: Partial<ICreateLoggerParams> = {}): ILogger => {
  const { options, parentLogger, bindings = {} } = params;
  if (parentLogger) {
    return parentLogger.child(bindings);
  }

  const logger = pino({
    level: 'info',
    name,
    mixin: () => ({ version }),
    ...options,
  });

  return bindings ? logger.child(bindings) : (logger as unknown as ILogger);
};
