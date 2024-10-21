import fs from 'fs';
import { TeeOrderEncryptedArgsConfiguration } from '@super-protocol/dto-js';
import { serverConfig } from './server-config';
import { EngineConfiguration, RawParameters } from './types';
import { findModel, isFileExisted, setupCharacter } from './utils';
import { rootLogger } from './logger';
import { config } from './config';

export class ConfigurationParser {
  private logger = rootLogger.child({
    module: ConfigurationParser.name,
  });
  private cliParams: string[] = [];

  async getCliParams(): Promise<string[]> {
    this.cliParams = [];

    if (!(await isFileExisted(serverConfig.configurationPath))) {
      this.logger.info('Configuration not found. Run with default params');
      return ['--listen-port', String(serverConfig.port)];
    }

    const configurationBuffer = await fs.promises.readFile(serverConfig.configurationPath);
    let configuration;
    try {
      configuration = JSON.parse(
        configurationBuffer.toString(),
      ) as TeeOrderEncryptedArgsConfiguration;
    } catch {
      throw new Error(`Configuration is not valid JSON`);
    }

    const { basic_settings, model, model_loader } = configuration.solution
      .engine as EngineConfiguration;

    await this.setupBaseConfiguration(basic_settings);
    await this.setupModelConfiguration(model);
    this.setupModelLoaderConfiguration(model_loader);

    return this.cliParams;
  }

  private async setupBaseConfiguration(
    baseSettings: EngineConfiguration['basic_settings'],
  ): Promise<void> {
    if (baseSettings.multi_user) {
      this.logger.info('Run in multi-user mode');
      this.cliParams.push('--multi-user');
    }

    if (baseSettings.api?.api_mode) {
      this.logger.info('Run in API-server mode');
      this.cliParams.push('--api', '--api-port', String(serverConfig.port));

      if (baseSettings.api?.api_key) {
        this.cliParams.push('--api-key', baseSettings.api?.api_key);
      }

      if (baseSettings.api?.admin_key) {
        this.cliParams.push('--admin-key', baseSettings.api?.admin_key);
      }
    } else {
      this.logger.info('Run in UI-server mode');
      this.cliParams.push('--listen-port', String(serverConfig.port));
    }

    const character = await setupCharacter(baseSettings.character);
    this.logger.info(`Character ${character} configured successfully`);
    this.cliParams.push('--character', character);
  }

  private async setupModelConfiguration(
    modelSettings: EngineConfiguration['model'],
  ): Promise<void> {
    const modelName = modelSettings.model_name;

    const modelInfo = await findModel(config.inputDataFolder, modelName);
    if (modelInfo) {
      this.cliParams.push(`--model-dir ${modelInfo.folder}`);
      this.cliParams.push(`--model ${modelInfo.model}`);
      this.logger.info(`Found model ${modelInfo.model} in ${modelInfo.folder}`);
    } else {
      this.logger.info(`Model not found. Engine will be started without models`);
    }

    if (modelSettings.chat_buttons) {
      this.cliParams.push(`--chat-buttons`);
    }

    const parametersString = Object.keys(modelSettings.parameters)
      .map((key) => `${key}: ${modelSettings.parameters[key]}`)
      .join('\n');

    await fs.promises.writeFile(
      `${serverConfig.engineFolder}/presets/min_p.yaml`,
      parametersString,
    );
  }

  private setupModelLoaderConfiguration(
    modelLoaderSettings: EngineConfiguration['model_loader'],
  ): void {
    const modelLoader = modelLoaderSettings.loader_name;
    this.cliParams.push(`--loader`, modelLoader);

    const loaderConfiguration = modelLoaderSettings[
      `${modelLoader.toLowerCase()}_options` as keyof typeof modelLoaderSettings
    ] as RawParameters | undefined;

    if (!loaderConfiguration) {
      this.logger.info(`Loader configurations for loader ${modelLoader} are not set`);
      return;
    }

    const params = Object.keys(loaderConfiguration);
    this.logger.info(`Adding next params: ${params.join(',')}`);

    params.forEach((key) => {
      this.cliParams.push(`--${key}`);
      if (typeof loaderConfiguration[key] !== 'boolean') {
        this.cliParams.push(String(loaderConfiguration[key]));
      }
    });
  }
}
