import {
  DomainConfig,
  findConfigsRecursive,
  TunnelClient,
  TunnelClientOptions,
} from '@super-protocol/tunnels-lib';
import { config } from './config';
import { rootLogger } from './logger';
import {
  EngineConfiguration,
  findCertFiles,
  getDomainConfig,
  readCertFiles,
  readConfiguration,
  updateCertFilesIfNeeded,
} from './solution-utils';

const getDomainConfigs = async (
  tunnelClientConfiguration?: EngineConfiguration['tunnel_client'],
): Promise<DomainConfig[]> => {
  if (!tunnelClientConfiguration) {
    return findConfigsRecursive(
      config.inputDataFolder,
      config.configFileName,
      config.configSearchFolderDepth,
      rootLogger,
    );
  }

  const domainConfig = await getDomainConfig({
    configuration: tunnelClientConfiguration,
    mrSigner: config.mrSigner,
    mrEnclave: config.mrEnclave,
    async getCertFiles() {
      const certFilesInSecrets = await findCertFiles(config.secretsDataFolder);
      if (!certFilesInSecrets) {
        throw new Error('No cert files found in secrets data folder');
      }

      return readCertFiles(certFilesInSecrets);
    },
    logger: rootLogger,
    blockchainUrl: config.blockchainUrl,
    contractAddress: config.blockchainContractAddress,
  });

  return [domainConfig];
};

const run = async (): Promise<void> => {
  const logger = rootLogger.child({ method: run.name });
  const configuration = await readConfiguration(config.configurationPath);
  const tunnelClientConfiguration = configuration?.solution?.engine as
    | EngineConfiguration['tunnel_client']
    | undefined;

  if (!tunnelClientConfiguration) {
    await updateCertFilesIfNeeded(logger);
  }

  const domainConfigs = await getDomainConfigs(tunnelClientConfiguration);

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

run().catch((err) => rootLogger.fatal({ err }, `Failed to start application`));
