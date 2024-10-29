import { DomainConfig, findConfigsRecursive } from '@super-protocol/tunnels-lib';
import { config } from '../config';
import { rootLogger } from '../logger';
import { findCertFiles, getDomainConfig, readCertFiles } from '@super-protocol/solution-utils';
import { EngineConfiguration } from './types';

export const getDomainConfigs = async (
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
      const certFilesInSecrets = await findCertFiles({
        searchPath: config.secretsDataFolder,
        certFileName: config.certFileName,
        certPrivateKeyFileName: config.certPrivateKeyFileName,
      });
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
