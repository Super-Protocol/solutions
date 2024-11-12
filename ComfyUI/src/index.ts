import { TunnelClient, TunnelClientOptions } from '@super-protocol/tunnels-lib';
import {
  readConfiguration,
  getDomainConfigs,
  TunnelsConfiguration,
} from '@super-protocol/solution-utils';
import { rootLogger } from './logger';
import { config } from './config';
import { exitOnSignals, exitOnUncaughtException, exitOnUnhandledRejection } from './process';

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
    contractAddress: config.contractAddress,
    logger,
  });

  logger.debug(
    { domains: domainConfigs.map((config) => config.site.domain) },
    'Found tunnel client domain configs',
  );

  const options: TunnelClientOptions = {
    logger: rootLogger,
    applicationPort: config.clientServerPort,
    sgxMockEnabled: true,
  };
  const tunnelClient = new TunnelClient(config.serverFilePath, domainConfigs, options);
  await tunnelClient.start();
};

run().catch((err) => {
  rootLogger.fatal({ err }, `Failed to start application`);
  process.exit(1);
});