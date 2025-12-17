import { readConfiguration } from '@super-protocol/solution-utils';
import { spawn } from 'child_process';
import fs from 'fs';
import { parentPort } from 'worker_threads';
import { config } from './config';
import { rootLogger } from './logger';
import { getServerConfig } from './server-config';
import { VllmEngineConfiguration, getVllmCliParams } from './solution-configuration';
import { WorkloadInfo } from '@super-protocol/dto-js';

const logger = rootLogger.child({ module: 'vllm-server.js' });

const terminationHandler = (signal: string): never => {
  logger.info(`${signal} received. Stopping vLLM server`);
  process.exit(0);
};

const handledSignals = ['SIGINT', 'SIGTERM'];
parentPort?.on('message', (message) => {
  if (handledSignals.includes(message)) {
    terminationHandler(message);
  }
});

export async function getGpuAvailableCores(): Promise<number> {
  try {
    const filePath = '/sp/certs/order_report.json';
    const fileContent = await fs.promises.readFile(filePath, 'utf-8');
    const workloadInfo: WorkloadInfo = JSON.parse(fileContent);

    return workloadInfo.orderCapacity ? workloadInfo.orderCapacity.gpuCores : 0;
  } catch (error) {
    console.error('Error while reading report:', error);
    return 0;
  }
}

const run = async (): Promise<void> => {
  try {
    const serverConfig = getServerConfig();

    // Setup SSL certificates
    await fs.promises.writeFile(serverConfig.privateKeyFilePath, serverConfig.tlsKey);
    await fs.promises.writeFile(serverConfig.certificateFilePath, serverConfig.tlsCert);
    logger.info('SSL certificates written successfully');

    // Read configuration
    const configuration = await readConfiguration(serverConfig.configurationPath);
    logger.info('Configuration loaded successfully');

    const vllmConfiguration = configuration?.solution?.engine as
      | VllmEngineConfiguration
      | undefined;
    if (vllmConfiguration) {
      vllmConfiguration.cache.gpu_memory_utilization = await getGpuAvailableCores();
    }

    // Generate CLI parameters for vLLM
    const { cliArgs, envVars } = await getVllmCliParams({
      configuration: vllmConfiguration,
      engineFolder: serverConfig.engineFolder,
      inputDataFolder: config.inputDataFolder,
      serverPort: serverConfig.port,
      logger: rootLogger,
    });

    logger.info(`Starting vLLM server with arguments: ${cliArgs.join(' ')}`);

    await new Promise<void>((resolve, reject) => {
      const vllmProcess = spawn(
        'python3',
        ['-m', 'vllm.entrypoints.openai.api_server', ...cliArgs],
        {
          stdio: 'inherit',
          env: {
            ...process.env,
            VLLM_LOGGING_LEVEL: 'INFO',
            ...envVars,
          },
        },
      );

      vllmProcess.on('spawn', () => {
        logger.info('vLLM server process spawned successfully');
      });

      vllmProcess.on('error', (error) => {
        logger.error({ error }, 'Failed to spawn vLLM server process');
        reject(error);
      });

      vllmProcess.on('exit', (code, signal) => {
        if (code === 0) {
          logger.info('vLLM server exited normally');
          resolve();
        } else if (signal) {
          logger.warn(`vLLM server killed by signal: ${signal}`);
          resolve();
        } else {
          logger.error(`vLLM server exited with code: ${code}`);
          reject(new Error(`vLLM server exited with code: ${code}`));
        }
      });

      // Handle stdout/stderr if not using inherit
      vllmProcess.stdout?.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          logger.info({ source: 'vllm-stdout' }, message);
        }
      });

      vllmProcess.stderr?.on('data', (data) => {
        const message = data.toString().trim();
        if (message) {
          logger.error({ source: 'vllm-stderr' }, message);
        }
      });

      // Graceful shutdown handling
      const shutdown = (signal: string): void => {
        logger.info(`Received ${signal}, shutting down vLLM server gracefully`);
        vllmProcess.kill('SIGTERM');

        // Force kill after timeout
        setTimeout(() => {
          logger.warn('Force killing vLLM server after timeout');
          vllmProcess.kill('SIGKILL');
        }, 10000); // 10 second timeout
      };

      process.on('SIGTERM', () => shutdown('SIGTERM'));
      process.on('SIGINT', () => shutdown('SIGINT'));
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start vLLM server');
    throw error;
  }
};

// Use the main implementation
run().catch((err) => {
  logger.fatal({ err }, 'vLLM server start command failed');
  process.exit(1);
});
