import fs from 'fs';
import { Logger } from 'pino';
import { EngineConfiguration, RawParameters } from './types';
import { setupCharacter } from './utils';
import { ModelDetector } from './model-detector';
import path from 'path';
import { spawn } from 'child_process';

export const getCliParams = async (params: {
  configuration?: EngineConfiguration;
  engineFolder: string;
  inputDataFolder: string;
  serverPort: number;
  logger: Logger;
}): Promise<string[]> => {
  const { configuration, engineFolder, serverPort, inputDataFolder, logger } = params;

  if (!configuration) {
    logger.info('Configuration not found. Run with default params');

    return ['--listen-port', String(serverPort)];
  }

  const cliParams = [
    ...(await setupBaseConfiguration(
      configuration.main_settings,
      serverPort,
      engineFolder,
      logger,
    )),
    ...(await setupModelConfiguration(configuration.model, engineFolder, inputDataFolder, logger)),
    ...setupModelLoaderConfiguration(configuration.model_loader, logger),
  ];


  // if model is loaded is autodetect or llama.cpp
  try {
    logger.warn('check if n_ctx is set');
    if (!cliParams.includes('--n_ctx')) {
      logger.warn('n_ctx not set, calculating optimal value...');

      const nCtx = await calculateModelContext(`${params.inputDataFolder}/input-0001`);
      logger.warn(`n_ctx: ${nCtx}`);
      // cliParams.push('--n_ctx', '4096');
    }
  } catch (err) {
    logger.warn({ err }, 'Failed to calculate optimal n_ctx, using default values');
  }

  return cliParams;
};

const setupBaseConfiguration = async (
  baseSettings: EngineConfiguration['main_settings'],
  serverPort: number,
  engineFolder: string,
  logger: Logger,
): Promise<string[]> => {
  const cliParams: string[] = [];

  if (baseSettings.mode?.multi_user) {
    logger.info('Run in multi-user mode');
    cliParams.push('--multi-user');
  }

  if (baseSettings.api?.api_mode) {
    logger.info('Run in API-server mode');
    cliParams.push('--api', '--api-port', String(serverPort));

    if (baseSettings.api?.api_key) {
      cliParams.push('--api-key', baseSettings.api?.api_key);
    }

    if (baseSettings.api?.admin_key) {
      cliParams.push('--admin-key', baseSettings.api?.admin_key);
    }
  } else {
    logger.info('Run in UI-server mode');
    cliParams.push('--listen-port', String(serverPort));
  }

  const character = await setupCharacter(baseSettings.character, engineFolder);
  logger.info(`Character ${character} configured successfully`);
  cliParams.push('--character', character);

  return cliParams;
};

const setupModelConfiguration = async (
  modelSettings: EngineConfiguration['model'],
  engineFolder: string,
  inputDataFolder: string,
  logger: Logger,
): Promise<string[]> => {
  const modelName = modelSettings.model_name;
  const cliParams: string[] = [];

  const modelInfo = await ModelDetector.detectModelPath(inputDataFolder, modelName);
  if (modelInfo) {
    cliParams.push(`--model-dir ${modelInfo.folder}`);
    cliParams.push(`--model ${modelInfo.model}`);
    logger.info(`Found model ${modelInfo.model} in ${modelInfo.folder}`);
  } else {
    logger.info(`Model not found. Engine will be started without models`);
  }

  if (modelSettings.chat_buttons) {
    cliParams.push(`--chat-buttons`);
  }

  const parameters = {
    ...modelSettings.parameters,
    ...modelSettings.parameters2,
  };

  const parametersString = Object.keys(parameters)
    .map((key) => `${key}: ${parameters[key]}`)
    .join('\n');

  await fs.promises.writeFile(`${engineFolder}/user_data/presets/min_p.yaml`, parametersString);

  return cliParams;
};

export const setupModelLoaderConfiguration = (
  modelLoaderSettings: EngineConfiguration['model_loader'],
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  const modelLoader = modelLoaderSettings.loader_name;
  cliParams.push(`--loader`, modelLoader);

  const modelId = modelLoader.toLowerCase().replaceAll('.', '');

  const loaderConfiguration = Object.assign(
    {},
    ...Object.entries(modelLoaderSettings)
      .filter(([key]) => key.includes(modelId))
      .map(([_, value]) => value),
  ) as RawParameters | undefined;

  if (!loaderConfiguration) {
    logger.info(`Loader configurations for loader ${modelLoader} are not set`);
    return cliParams;
  }

  const params = Object.keys(loaderConfiguration);
  logger.info(`Adding next params: ${params.join(',')}`);

  params.forEach((key) => {
    cliParams.push(`--${key}`);
    if (typeof loaderConfiguration[key] !== 'boolean') {
      cliParams.push(String(loaderConfiguration[key]));
    }
  });

  return cliParams;
};

const calculateModelContext = async (modelPath: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.resolve(__dirname, '..', 'scripts', 'calculate_n_ctx.py');
    const pythonProcess = spawn('python3', [scriptPath, modelPath, '--vram', '12'], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let output = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Python script failed. Code: ${code}. Output: ${output}. Error: ${error}`));
        return;
      }

      try {
        const result = JSON.parse(output);
        if (result.error) {
          reject(new Error(result.error));
          return;
        }
        resolve(result.n_ctx);
      } catch (e) {
        reject(new Error(`Failed to parse Python script output: ${e}`));
      }
    });
  });
};
