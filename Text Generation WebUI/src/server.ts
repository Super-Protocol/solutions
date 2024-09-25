import fs from 'fs';

import { spawn } from 'child_process';
import { parentPort } from 'worker_threads';
import { rootLogger } from './logger';
import { config } from './config';
import { findModelDir } from './utils';
import { serverConfig } from './server-config';

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
  await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey);
  await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert);

  const spawnOptions = [
    '--listen-port',
    String(serverConfig.port),
    '--ssl-keyfile',
    serverConfig.privateKeyFilePath,
    '--ssl-certfile',
    serverConfig.certificateFilePath,
    '--max_seq_len',
    '16384',
  ];

  const modelDir = await findModelDir(config.inputDataFolder);
  if (modelDir) {
    spawnOptions.push(`--model-dir ${modelDir}`);
    logger.info(`Found models in ${modelDir}`);
  } else {
    logger.info(`Model not found. Engine will be started without models`);
  }

  await new Promise((_resolve, _reject) => {
    const pythonProcess = spawn(`${serverConfig.engineFolder}/start_linux.sh`, spawnOptions, {
      stdio: 'inherit',
      env: {
        ...process.env,
      },
    });

    pythonProcess.stdout?.on('data', (data) => {
      const message = data?.toString();
      logger.info(message);
    });

    pythonProcess.stderr?.on('data', (data) => logger.error(data.toString()));
  });
};

run().catch((err) => {
  logger.fatal({ err }, `Text-generation webui start command failed`);
});
