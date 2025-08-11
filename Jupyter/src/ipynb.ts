import fs from 'fs';
import path from 'path';
import { exec as execCallback } from 'child_process';
import { promisify } from 'util';
import { FindFileResult } from './types';
import { rootLogger } from './logger';

const exec = promisify(execCallback);

export const findIpynbFile = async (
  folderPath: string,
  filename?: string,
): Promise<FindFileResult | undefined> => {
  const logger = rootLogger.child({ module: 'findIpynbFile' });

  try {
    const filesOrDirectories = await fs.promises.readdir(folderPath, { withFileTypes: true });
    for (const fileOrDir of filesOrDirectories) {
      if (fileOrDir.isDirectory()) {
        const subFolderPath = `${folderPath}/${fileOrDir.name}`;
        const foundFile = await findIpynbFile(subFolderPath, filename);
        if (foundFile) {
          return foundFile;
        }
      } else if (fileOrDir.name.endsWith('.ipynb')) {
        if (!filename || fileOrDir.name === filename) {
          return { folder: folderPath, filename: fileOrDir.name };
        }
      }
    }
  } catch (error) {
    logger.error({ err: error }, 'Error while searching for ipynb file');
    return;
  }
};

export const runIpymbFile = async (filePath: string): Promise<void> => {
  const logger = rootLogger.child({ module: 'runIpymbFile' });
  const filename = path.basename(filePath);

  try {
    const command = `jupyter nbconvert --execute --inplace "${filePath}" --stdout > /sp/output/${filename}.log`;
    logger.info(`Executing command: ${command}`);
    const { stdout, stderr } = await exec(command);
    if (stdout) {
      logger.info(`Command output: ${stdout}`);
    }
    if (stderr) {
      logger.error(`Command error output: ${stderr}`);
    }
  } catch (error) {
    logger.error({ err: error }, `Failed to run ipynb file: ${filePath}`);
    throw error;
  }
};
