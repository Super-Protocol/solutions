import { spawn } from 'child_process';
import * as fs from 'fs';
import { parentPort } from 'worker_threads';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';

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

  spawn('uvicorn', [
    'server:app',
    '--ssl-keyfile', serverConfig.privateKeyFilePath,
    '--ssl-certfile', serverConfig.certificateFilePath,
    '--host', '0.0.0.0',
    '--port', String(serverConfig.port),
  ], {
    stdio: 'inherit',
    cwd: serverConfig.diaServerPath,
    env: {
      ...process.env,
      DIA_MODEL_CACHE_PATH: '/sp/inputs/input-0001'
    },
  });
};

run().catch((err) => {
  logger.fatal({ err }, `Dia-TTS-Server start command failed`);
});
