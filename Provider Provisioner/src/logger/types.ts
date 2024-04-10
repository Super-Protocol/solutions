import { Bindings, LogFn, LoggerOptions } from 'pino';

export type ILoggerOptions = LoggerOptions;
export type IBindings = Bindings;
export interface ILogger {
  trace: LogFn;
  debug: LogFn;
  info: LogFn;
  warn: LogFn;
  error: LogFn;
  fatal: LogFn;
  audit: LogFn;

  child(bindings: IBindings): ILogger;
}
