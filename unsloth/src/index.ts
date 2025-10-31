import { TunnelClient, TunnelClientOptions } from "@super-protocol/tunnels-lib";
import {
  readConfiguration,
  getDomainConfigs,
  TunnelsConfiguration,
  exitOnUnhandledRejection,
  exitOnUncaughtException,
  exitOnSignals,
} from "@super-protocol/solution-utils";
import { rootLogger } from "./logger";
import { config } from "./config";
import { IUnslothEngineConfiguration, RunMode } from "./types";
import { findFile, runIpynbFile, runPythonFile } from "./helpers";

exitOnUnhandledRejection(rootLogger);
exitOnUncaughtException(rootLogger);
exitOnSignals(rootLogger);

const run = async (): Promise<void> => {
  const logger = rootLogger.child({ method: run.name });
  const configuration = await readConfiguration(config.configurationPath);
  const engineConfiguration = configuration?.solution?.engine as
    | IUnslothEngineConfiguration
    | undefined;
  const runMode = engineConfiguration?.main_settings?.run_mode;
  if (!runMode) {
    throw new Error(
      "Run mode is not specified in the configuration or configuration is invalid",
    );
  }

  switch (runMode) {
    case RunMode.RunFile: {
      const filename =
        engineConfiguration.main_settings.run_file_options?.filename;
      if (!filename) {
        throw new Error(
          'Filename must be specified in run_file_options to run in "Run file" mode',
        );
      }

      const foundFile = await findFile(config.inputDataFolder, filename);
      if (!foundFile) {
        throw new Error(
          `No file ${filename || ""} found in ${config.inputDataFolder}`,
        );
      }
      logger.info(`Found file: ${foundFile.folder}/${foundFile.filename}`);

      if (filename.endsWith(".py")) {
        await runPythonFile(`${foundFile.folder}/${foundFile.filename}`);
      } else if (filename.endsWith(".ipynb")) {
        await runIpynbFile(`${foundFile.folder}/${foundFile.filename}`);
      } else {
        throw new Error(
          `Unsupported file type for file: ${filename}. Only .py and .ipynb files are supported`,
        );
      }
      break;
    }
    case RunMode.Jupyter: {
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
        "Found tunnel client domain configs",
      );

      const options: TunnelClientOptions = {
        logger: rootLogger,
        applicationPort: config.clientServerPort,
        localServerStartTimeout: config.localServerStartTimeoutMs,
      };
      const tunnelClient = new TunnelClient(
        config.serverFilePath,
        domainConfigs,
        options,
      );
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
