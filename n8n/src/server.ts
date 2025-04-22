import { spawn } from 'child_process';
import fs from 'fs';
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

  // Write TLS files with restricted permissions (read/write only for owner)
  await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey, {
    mode: 0o600,
  });
  await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert, {
    mode: 0o600,
  });

  spawn(`node_modules/.bin/n8n`, [], {
    stdio: 'inherit',
    env: {
      ...process.env,
      N8N_HIRING_BANNER_ENABLED: 'false',
      N8N_DIAGNOSTICS_ENABLED: 'false',
      N8N_PROTOCOL: 'https',
      N8N_PORT: String(serverConfig.port),
      N8N_SSL_KEY: serverConfig.privateKeyFilePath,
      N8N_SSL_CERT: serverConfig.certificateFilePath,
    },
  });
};

run().catch((err) => {
  logger.fatal({ err }, `n8n start command failed`);
});
