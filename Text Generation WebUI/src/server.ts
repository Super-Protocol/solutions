import { readConfiguration } from '@super-protocol/solution-utils';
import { spawn } from 'child_process';
import fs from 'fs';
import { parentPort } from 'worker_threads';
import { config } from './config';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';
import { EngineConfiguration, getCliParams } from './solution-configuration';

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

  await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey);
  await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert);
  const configuration = await readConfiguration(serverConfig.configurationPath);

  const cliParams = await getCliParams({
    configuration: configuration?.solution?.engine as EngineConfiguration | undefined,
    engineFolder: serverConfig.engineFolder,
    inputDataFolder: config.inputDataFolder,
    serverPort: serverConfig.port,
    logger: rootLogger,
    modelSizeThreshold: serverConfig.modelSizeThreshold,
  });

  const spawnOptions = [
    '--ssl-keyfile',
    serverConfig.privateKeyFilePath,
    '--ssl-certfile',
    serverConfig.certificateFilePath,
    ...cliParams,
  ];

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
