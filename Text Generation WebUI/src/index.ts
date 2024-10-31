import { readConfiguration, updateCertFilesIfNeeded } from '@super-protocol/solution-utils';
import { TunnelClient, TunnelClientOptions } from '@super-protocol/tunnels-lib';
import { config } from './config';
import { rootLogger } from './logger';
import { SolutionConfiguration } from './solution-configuration';
import { getDomainConfigs } from './solution-configuration/get-domain-configs';

const run = async (): Promise<void> => {
  const logger = rootLogger.child({ method: run.name });
  const configuration = await readConfiguration(config.configurationPath);
  const solutionConfiguration = configuration?.solution as SolutionConfiguration | undefined;
  const tunnelsConfiguration = solutionConfiguration?.tunnels;

  if (!tunnelsConfiguration) {
    await updateCertFilesIfNeeded({
      certFileName: config.certFileName,
      certPrivateKeyFileName: config.certPrivateKeyFileName,
      inputDataFolder: config.inputDataFolder,
      secretsDataFolder: config.secretsDataFolder,
      logger,
    });
  }

  const domainConfigs = await getDomainConfigs(tunnelsConfiguration);

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
