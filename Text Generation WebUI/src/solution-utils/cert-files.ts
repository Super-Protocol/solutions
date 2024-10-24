import { X509Certificate } from 'crypto';
import { copyFile, readFile } from 'fs/promises';
import path from 'path';
import { Logger } from 'pino';
import { isCertValid, parseFullchainPem, verifyCertificateChain } from './cert-utils';
import { config } from '../config';
import { findFileOrDirectory } from '../utils';

type CertFiles = {
  certFilePath: string;
  certPrivateKeyPath: string;
};

export const readCertFiles = async (
  certFiles: CertFiles,
): Promise<{ fullchainPem: string; privateKeyPem: string }> => {
  const fullchainPem = await readFile(certFiles.certFilePath, 'utf-8');
  const privateKeyPem = await readFile(certFiles.certPrivateKeyPath, 'utf-8');

  return {
    fullchainPem,
    privateKeyPem,
  };
};

export const findCertFiles = async (searchPath: string): Promise<CertFiles | null> => {
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

  const input = await readCertFiles(certFilesInInputs);
  const isInputValid = isCertValid({
    certificate: input.fullchainPem,
    privateKey: input.privateKeyPem,
  });
  if (!isInputValid) {
    logger.debug('Input cert files are not valid');
    return;
  }

  const certFilesInSecrets = await findCertFiles(config.secretsDataFolder);
  if (!certFilesInSecrets) {
    logger.debug('No cert files found in secrets data folder');
  } else {
    logger.debug('Cert files found in secrets data folder');
  }

  const needToCopy = async (): Promise<boolean> => {
    const isInputChainValid = verifyCertificateChain(parseFullchainPem(input.fullchainPem));
    if (!isInputChainValid) {
      logger.warn('Input certificate chain is not valid');
      return false;
    }

    logger.debug('Input certificate chain is valid');

    if (!certFilesInSecrets) {
      return true;
    }

    const secret = await readCertFiles(certFilesInSecrets);
    const secretCert = new X509Certificate(secret.fullchainPem);
    const inputCert = new X509Certificate(input.fullchainPem);

    return (
      inputCert.subject === secretCert.subject &&
      new Date(inputCert.validTo) > new Date(secretCert.validTo)
    );
  };

  if (await needToCopy()) {
    logger.debug('Input cert files are newer than secrets cert files');

    await copyFile(
      certFilesInInputs.certFilePath,
      path.resolve(config.secretsDataFolder, config.certFileName),
    );
    await copyFile(
      certFilesInInputs.certPrivateKeyPath,
      path.resolve(config.secretsDataFolder, config.certPrivateKeyFileName),
    );

    logger.debug(
      { certFilesInInputs, certFilesInSecrets },
      'Copied cert files from input data folder to secrets data folder',
    );
  } else {
    logger.debug('No need to copy cert files');
  }
};
