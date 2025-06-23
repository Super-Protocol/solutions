import { rootLogger } from './logger';
import { config } from './config';

const logger = rootLogger.child({ module: 'index' });

const main = async (): Promise<void> => {
  try {
    logger.info(`Starting ${config.appName} v${config.appVersion}`);
    
    // Запускаем сервер
    require('./server');
    
  } catch (error) {
    logger.fatal({ error }, 'Failed to start application');
    process.exit(1);
  }
};

main();
