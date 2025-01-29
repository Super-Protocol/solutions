import fs from 'fs';
import { once } from 'node:events';
import { spawn } from 'child_process';
import { parentPort } from 'worker_threads';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';
import { processConfigurationAngGetCliParams } from './engine-configuration/process-configuration-and-get-cli-params';

const logger = rootLogger.child({ module: 'server.js' });

const abortController = new AbortController();

const handledSignals = ['SIGINT', 'SIGTERM'];
parentPort?.on('message', (message) => {
  if (handledSignals.includes(message)) {
    logger.info(`${message} received. Stopping`);
    abortController.abort();
  }
});

const run = async (): Promise<void> => {
  const serverConfig = getServerConfig();
  await Promise.all([
    fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey),
    fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert),
  ]);

  const cliParams = await processConfigurationAngGetCliParams();

  const spawnOptions = [
    'launch',
    '--',
    '--listen',
    '*',
    '--port',
    String(serverConfig.port),
    '--tls-keyfile',
    serverConfig.privateKeyFilePath,
    '--tls-certfile',
    serverConfig.certificateFilePath,
    '--disable-auto-launch',
    '--cpu',
    '--cpu-vae',
    ...cliParams,
  ];

  logger.trace({ cliParams: spawnOptions }, `ComfyUI will be started with cli params`);

  const pythonProcess = spawn('comfy', spawnOptions, {
    stdio: ['ignore', 'inherit', 'inherit'],
    signal: abortController.signal,
  });

  // // Create readline interfaces for stdout and stderr
  // const rlOut = readline.createInterface({
  //   input: pythonProcess.stdout,
  //   crlfDelay: Infinity,
  // });

  // const rlErr = readline.createInterface({
  //   input: pythonProcess.stderr,
  //   crlfDelay: Infinity,
  // });

  // rlOut.on('line', (line) => logger.info(line));
  // rlErr.on('line', (line) => logger.error(line));

  const [code] = await once(pythonProcess, 'close');
  logger.info(`Process exited with code ${code}`);
  // rlErr.close();
  // rlOut.close();
};

run().catch((err) => {
  logger.fatal({ err }, `ComfyUI start command failed`);
  process.exit(1);
});
