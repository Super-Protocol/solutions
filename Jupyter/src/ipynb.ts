import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { FindFileResult } from './types';
import { rootLogger } from './logger';
import { config } from './config';


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
    const commandParams = [`nbconvert`, `--execute`, `--inplace`, `"${filePath}"`, `--stdout`];

    const logPath = path.join(config.outputDataFolder, `${filename}.log`);
    const logStream = fs.createWriteStream(logPath);


    logger.info({ commandParams }, `Executing jupyter with params`);
    const commandProcess = await spawn('jupyter', commandParams, { stdio: 'pipe' });
    commandProcess.stdout.pipe(logStream);

    await new Promise((resolve, reject) => {
      commandProcess.on('close', (code) => {
        if (code === 0) resolve(void 0);
        else reject(new Error(`Process exited with code ${code}`));
      });
      commandProcess.on('error', reject);
    });
  } catch (error) {
    logger.error({ err: error }, `Failed to run ipynb file: ${filePath}`);
    throw error;
  }
};
