import fs from 'fs';
import { spawn } from 'child_process';
import { parentPort } from 'worker_threads';
import { rootLogger } from './logger';
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
    `${serverConfig.engineFolder}/main.py`,
    '--port',
    serverConfig.port,
    '--tls-keyfile',
    serverConfig.privateKeyFilePath,
    '--tls-certfile',
    serverConfig.certificateFilePath,
  ];

  await new Promise((_resolve, _reject) => {
    const pythonProcess = spawn(`python`, spawnOptions, {
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

    pythonProcess.on('close', (code) => {
      logger.info(`Process exited with code ${code}`);
    });
  });
};

run().catch((err) => {
  logger.fatal({ err }, `Text-generation webui start command failed`);
});
