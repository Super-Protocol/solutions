import {
  findConfigsRecursive,
  TunnelClient,
  TunnelClientOptions,
} from '@super-protocol/tunnels-lib';
import { rootLogger } from './logger';
import { config } from './config';
import { exitOnSignals, exitOnUncaughtException, exitOnUnhandledRejection } from './process';

exitOnUnhandledRejection(rootLogger);
exitOnUncaughtException(rootLogger);
exitOnSignals(rootLogger);

const run = async (): Promise<void> => {
  const tunnelClientConfigs = await findConfigsRecursive(
    config.inputDataFolder,
    config.configFileName,
    config.configSearchFolderDepth,
    rootLogger,
  );

  const options: TunnelClientOptions = {
    logger: rootLogger,
    applicationPort: config.clientServerPort,
    sgxMockEnabled: true,
  };
  const tunnelClient = new TunnelClient(config.serverFilePath, tunnelClientConfigs, options);
  await tunnelClient.start();
};

run().catch((err) => rootLogger.fatal({ err }, `Failed to start application`));
