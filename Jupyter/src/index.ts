import { TunnelClient, TunnelClientOptions } from '@super-protocol/tunnels-lib';
import {
  readConfiguration,
  getDomainConfigs,
  TunnelsConfiguration,
  exitOnUnhandledRejection,
  exitOnUncaughtException,
  exitOnSignals,
} from '@super-protocol/solution-utils';
import { rootLogger } from './logger';
import { config } from './config';
import { IJupyterEngineConfiguration, RunMode } from './types';
import { findIpynbFile, runIpynbFile } from './ipynb';

exitOnUnhandledRejection(rootLogger);
exitOnUncaughtException(rootLogger);
exitOnSignals(rootLogger);

const run = async (): Promise<void> => {
  const logger = rootLogger.child({ method: run.name });
  const configuration = await readConfiguration(config.configurationPath);
  const engineConfiguration = configuration?.solution?.engine as
    | IJupyterEngineConfiguration
    | undefined;
  const runMode = engineConfiguration?.main_settings?.run_mode;
  if (!runMode) {
    throw new Error('Run mode is not specified in the configuration or configuration is invalid');
  }

  switch (runMode) {
    case RunMode.ProcessIpynbFile: {
      const filename = engineConfiguration.main_settings.process_file_options?.filename;
      const foundFile = await findIpynbFile(config.inputDataFolder, filename);
      if (!foundFile) {
        throw new Error(`No ipynb file ${filename || ''} found in ${config.inputDataFolder}`);
      }
      logger.info(`Found ipynb file: ${foundFile.folder}/${foundFile.filename}`);

      await runIpynbFile(`${foundFile.folder}/${foundFile.filename}`);
      return;
    }
    case RunMode.StartServer: {
      const tunnelsConfiguration = configuration?.solution?.tunnels as
        | TunnelsConfiguration
        | undefined;

      const domainConfigs = await getDomainConfigs({
        tunnels: tunnelsConfiguration,
        blockchainUrl: config.blockchainUrl,
        contractAddress: config.blockchainContractAddress,
        logger,
      });

      logger.debug(
        { domains: domainConfigs.map((config) => config.site.domain) },
        'Found tunnel client domain configs',
      );

      const options: TunnelClientOptions = {
        logger: rootLogger,
        applicationPort: config.clientServerPort,
        localServerStartTimeout: config.localServerStartTimeoutMs,
      };
      const tunnelClient = new TunnelClient(config.serverFilePath, domainConfigs, options);
      await tunnelClient.start();
      break;
    }
    default:
      throw new Error(`Unsupported run mode: ${runMode}`);
  }
};

run().catch((err) => {
  rootLogger.fatal({ err }, `Failed to start application`);
  process.exit(1);
});
