import fs from 'fs';
import path from 'path';
import { findModel, readConfiguration } from '@super-protocol/solution-utils';
import { rootLogger } from '../logger';
import { ComfyuiConfiguration } from './types';
import { getServerConfig, IServerConfig } from '../server-config';
import { config } from '../config';
import { Logger } from 'pino';
import { ExtraModelPathBuilder } from './extra-model-path-builder';

const EXTRA_MODEL_PATH_FILENAME = 'extra_model_paths.yaml';

export const processConfigurationAngGetCliParams = async (): Promise<string[]> => {
  const logger = rootLogger.child({
    method: processConfigurationAngGetCliParams.name,
  });
  const serverConfig = getServerConfig();
  const configuration = await readConfiguration(serverConfig.configurationPath);
  const engineConfiguration = configuration?.solution?.engine as
    | ComfyuiConfiguration['engine']
    | undefined;

  if (!engineConfiguration) {
    logger.info(`Configuration not found`);
    return [];
  }

  const mainSettings = engineConfiguration.main_settings;

  return [...setupMainConfiguration(mainSettings), ...(await setupModels(serverConfig, logger))];
};

const setupMainConfiguration = (
  mainSettings: ComfyuiConfiguration['engine']['main_settings'],
): string[] => {
  const params: string[] = [];

  if (mainSettings.compute) {
    params.push(`--${mainSettings.compute}`);
  }

  if (mainSettings.enable_cors_header) {
    params.push(`--enable-cors-header`);
  }

  if (mainSettings.cuda_malloc) {
    const cudaParam =
      mainSettings.cuda_malloc === 'Enable' ? '--cuda-malloc' : '--disable-cuda-malloc';
    params.push(cudaParam);
  }

  if (mainSettings.fp) {
    params.push(`--${mainSettings.fp.replaceAll(' ', '-')}`);
  }

  if (mainSettings.fpunet) {
    params.push(`--${mainSettings.fpunet}`);
  }

  if (mainSettings.fpvae) {
    params.push(`--${mainSettings.fpvae}`);
  }

  if (mainSettings.cpu_vae) {
    params.push(`--cpu-vae`);
  }

  if (mainSettings.text_enc) {
    params.push(`--${mainSettings.text_enc}`);
  }

  if (mainSettings.force_channel_last) {
    params.push(`--force-channels-last`);
  }

  if (mainSettings.preview_method) {
    params.push(`--preview-method`, mainSettings.preview_method);
  }

  if (mainSettings.preview_size) {
    params.push(`--preview-size`, String(mainSettings.preview_size));
  }

  if (mainSettings.upcast_attestation) {
    params.push(`--${mainSettings.upcast_attestation}`);
  }

  if (mainSettings.disable_smart_memory) {
    params.push(`--disable-smart-memory`);
  }

  if (mainSettings.deterministic) {
    params.push(`--deterministic`);
  }

  return params;
};

const setupModels = async (serverConfig: IServerConfig, logger: Logger): Promise<string[]> => {
  const modelInfo = await findModel(config.inputDataFolder, serverConfig.modelSizeThreshold);
  if (!modelInfo) {
    logger.info(`Model was not found. Launching without model`);

    return [];
  }

  logger.info({ modelInfo }, `Model was found`);

  const extraModelPathData = new ExtraModelPathBuilder()
    .setModelPath('checkpoints', modelInfo.folder)
    .build();

  const extraModelPathFilepath = path.join(serverConfig.engineFolder, EXTRA_MODEL_PATH_FILENAME);
  await fs.promises.writeFile(extraModelPathFilepath, extraModelPathData);

  return ['--extra-model-paths-config', extraModelPathFilepath];
};
