/* eslint-disable @typescript-eslint/no-explicit-any */
import { PinoLogger } from '@super-protocol/tunnels-lib';

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    return `ErrorMessage: ${error.message}; ErrorStack: ${error.stack}`;
  }

  return `Json Error: ${JSON.stringify(error)}`;
};

export const exitOnUnhandledRejection = (logger: PinoLogger, errorCode = 1): void => {
  process.on('unhandledRejection', (error, origin): void => {
    logger.fatal(
      {
        err: error,
        message: getErrorMessage(error),
        origin,
      },
      'Uncaught exception. The process should be stopped.',
    );

    process.exit(errorCode);
  });
};

export const exitOnUncaughtException = (logger: PinoLogger, errorCode = 1): void => {
  process.on('uncaughtException', (error) => {
    logger.fatal(
      {
        err: error,
        message: getErrorMessage(error),
      },
      'Unhandled rejection. The process should be stopped.',
    );

    process.exit(errorCode);
  });
};

export const exitOnSignals = (logger: PinoLogger, exitCode = 0, timeout = 25000): void => {
  const handle = (signal: string): void => {
    logger.info({ signal }, `Catch signal. Stopping process with: ${exitCode}`);

    setTimeout(() => process.exit(exitCode), timeout);
  };

  process.on('SIGINT', handle).on('SIGABRT', handle).on('SIGTERM', handle);
};
