import {
  findConfigsRecursive,
  TunnelClient,
  TunnelClientOptions,
} from '@super-protocol/tunnels-lib';
import { config } from './config';
import { findConfigInConfiguration } from './find-config-in-configuration';
import { rootLogger } from './logger';

const run = async (): Promise<void> => {
  const configInConfiguration = await findConfigInConfiguration({
    configurationPath: config.configurationPath,
    mrSigner: config.mrSigner,
    mrEnclave: config.mrEnclave,
    logger: rootLogger,
  });
  const tunnelClientConfigs = configInConfiguration
    ? [configInConfiguration]
    : await findConfigsRecursive(
        config.inputDataFolder,
        config.configFileName,
        config.configSearchFolderDepth,
        rootLogger,
      );

  rootLogger.child({ module: 'run' }).debug({ tunnelClientConfigs }, 'Found tunnel client configs');

  const options: TunnelClientOptions = {
    logger: rootLogger,
    applicationPort: config.clientServerPort,
    sgxMockEnabled: true,
  };
  const tunnelClient = new TunnelClient(config.serverFilePath, tunnelClientConfigs, options);
  await tunnelClient.start();
};

run().catch((err) => rootLogger.fatal({ err }, `Failed to start application`));
