import path from 'path';
import fs from 'fs-extra';
import { getServerConfig } from '../server-config';
import { rootLogger } from '../logger';

export const disableComfyuiManager = async (): Promise<void> => {
  const logger = rootLogger.child({ method: disableComfyuiManager.name });
  logger.info(`Disabling ComfyUi Manager`);
  const serverConfig = getServerConfig();
  const comfyuiManagerPath = path.join(
    serverConfig.engineFolder,
    'custom_nodes',
    'ComfyUI-Manager',
  );

  await fs.move(comfyuiManagerPath, `${comfyuiManagerPath}.disabled`);
};
