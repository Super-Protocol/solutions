import fs from 'fs/promises';
import path from 'path';
import { Logger } from 'pino';
import { config } from './config';
import { findFileOrDirectory } from './utils';

const findCertFiles = async (
  searchPath: string,
): Promise<{ certFilePath: string; certPrivateKeyPath: string } | null> => {
  const cert = await findFileOrDirectory(config.certFileName, searchPath);
  if (!cert) {
    return null;
  }

  const certPrivateKey = await findFileOrDirectory(config.certPrivateKeyFileName, searchPath);
  if (!certPrivateKey) {
    return null;
  }

  return {
    certFilePath: cert.fullPath,
    certPrivateKeyPath: certPrivateKey.fullPath,
  };
};

export const updateCertFilesIfNeeded = async (logger: Logger): Promise<void> => {
  logger = logger.child({ method: updateCertFilesIfNeeded.name });

  const certFilesInInputs = await findCertFiles(config.inputDataFolder);
  if (!certFilesInInputs) {
    logger.debug('No cert files found in input data folder');
    return;
  }
  logger.debug('Cert files found in input data folder');

  const certFilesInSecrets = await findCertFiles(config.secretsDataFolder);
  if (!certFilesInSecrets) {
    logger.debug('No cert files found in secrets data folder');
  } else {
    logger.debug('Cert files found in secrets data folder');
  }

  const needToValidateCertFiles = Boolean(certFilesInSecrets);
  if (needToValidateCertFiles) {
    // TODO: check if cert files are valid
    logger.debug('Cert files validated');
  }

  await fs.copyFile(
    certFilesInInputs.certFilePath,
    path.resolve(config.secretsDataFolder, config.certFileName),
  );
  await fs.copyFile(
    certFilesInInputs.certPrivateKeyPath,
    path.resolve(config.secretsDataFolder, config.certPrivateKeyFileName),
  );

  logger.debug(
    { certFilesInInputs, certFilesInSecrets },
    'Copied cert files from input data folder to secrets data folder',
  );
};
