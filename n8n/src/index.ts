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

exitOnUnhandledRejection(rootLogger);
exitOnUncaughtException(rootLogger);
exitOnSignals(rootLogger);

const run = async (): Promise<void> => {
  const logger = rootLogger.child({ method: run.name });
  const configuration = await readConfiguration(config.configurationPath);
  const tunnelsConfiguration = configuration?.solution?.tunnels as TunnelsConfiguration | undefined;

  const domainConfigs = await getDomainConfigs({
    tunnels: tunnelsConfiguration,
    blockchainUrl: config.blockchainUrl,
    contractAddress: config.blockchainContractAddress,
    logger,
  });

  const domains = domainConfigs.map((config) => config.site.domain);
  logger.debug({ domains }, 'Found tunnel client domain configs');

  process.env.WEBHOOK_URL = `https://${domains[0]}`

  const options: TunnelClientOptions = {
    logger: rootLogger,
    applicationPort: config.clientServerPort,
    localServerStartTimeout: 60000,
  };
  const tunnelClient = new TunnelClient(config.serverFilePath, domainConfigs, options);
  await tunnelClient.start();
};

run().catch((err) => {
  rootLogger.fatal({ err }, `Failed to start application`);
  process.exit(1);
});
