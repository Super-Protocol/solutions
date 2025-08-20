import { spawn } from 'child_process';
import * as fs from 'fs';
import { parentPort } from 'worker_threads';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';
import { findIpynbFile } from './ipynb';
import { config } from './config';

const logger = rootLogger.child({ module: 'server.js' });

const terminationHandler = (signal: string): never => {
  logger.info(`${signal} received. Stopping`);
  process.exit(0);
};

const handledSignals = ['SIGINT', 'SIGTERM'];
parentPort?.on('message', (message) => {
  if (handledSignals.includes(message)) {
    terminationHandler(message);
  }
});

const run = async (): Promise<void> => {
  const serverConfig = getServerConfig();

  await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey, {
    mode: 0o600,
  });
  await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert, {
    mode: 0o600,
  });

  const foundIpynbFile = await findIpynbFile(config.inputDataFolder);
  const startDir = foundIpynbFile?.folder;

  spawn(
    'jupyter',
    [
      `notebook`,
      `--NotebookApp.token=''`,
      `--NotebookApp.password=''`,
      `--certfile=${serverConfig.certificateFilePath}`,
      `--keyfile=${serverConfig.privateKeyFilePath}`,
      `--notebook-dir=${startDir || '/sp/output'}`,
      `--port=${serverConfig.port}`,
      `--NotebookApp.allow_origin='*'`,
      `--NotebookApp.disable_check_xsrf=True`,
      `--allow-root`,
      `--no-browser`,
      `-y`,
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    },
  );
};

run().catch((err) => {
  logger.fatal({ err }, `Jupyter server start command failed`);
});
