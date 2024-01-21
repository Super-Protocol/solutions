import { promises as fsPromise } from 'fs';
import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const execPromise = promisify(execCallback);

export const prepareRootCertificates = async (folderPath: string): Promise<void> => {
  await fsPromise.access(folderPath);

  const command = `cd ${folderPath} && cat /etc/ssl/certs/*.pem >> ./ca_certificates.crt`;
  const result = await execPromise(command);

  if (result.stderr) {
    throw new Error(`prepareRootCertificates error ${result.stderr}`);
  }
};
