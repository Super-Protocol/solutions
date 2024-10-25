import fs from 'fs';
import { Logger } from 'pino';
import { EngineConfiguration, RawParameters } from '../types';
import { findModel, setupCharacter } from '../utils';

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

  return [
    ...(await setupBaseConfiguration(configuration.basic_settings, serverPort, logger)),
    ...(await setupModelConfiguration(configuration.model, engineFolder, inputDataFolder, logger)),
    ...setupModelLoaderConfiguration(configuration.model_loader, logger),
  ];
};

const setupBaseConfiguration = async (
  baseSettings: EngineConfiguration['basic_settings'],
  serverPort: number,
  logger: Logger,
): Promise<string[]> => {
  const cliParams: string[] = [];

  if (baseSettings.multi_user) {
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

  const character = await setupCharacter(baseSettings.character);
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

  const modelInfo = await findModel(inputDataFolder, modelName);
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

  const parametersString = Object.keys(modelSettings.parameters)
    .map((key) => `${key}: ${modelSettings.parameters[key]}`)
    .join('\n');

  await fs.promises.writeFile(`${engineFolder}/presets/min_p.yaml`, parametersString);

  return cliParams;
};

const setupModelLoaderConfiguration = (
  modelLoaderSettings: EngineConfiguration['model_loader'],
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  const modelLoader = modelLoaderSettings.loader_name;
  cliParams.push(`--loader`, modelLoader);

  const loaderConfiguration = modelLoaderSettings[
    `${modelLoader.toLowerCase()}_options` as keyof typeof modelLoaderSettings
  ] as RawParameters | undefined;

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

  return params;
};
