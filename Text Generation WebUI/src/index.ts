import {
  findConfigsRecursive,
  TunnelClient,
  TunnelClientOptions,
} from '@super-protocol/tunnels-lib';
import { config } from './config';
import { rootLogger } from './logger';
import { getDomainConfig, readConfiguration } from './solution-configuration';
import { EngineConfiguration } from './types';

const run = async (): Promise<void> => {
  const configuration = await readConfiguration(config.configurationPath);
  if (!configuration) {
    throw new Error('Configuration not found');
  }

  const configInConfiguration = await getDomainConfig({
    configuration: (configuration.solution.engine as EngineConfiguration).tunnel_client,
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
