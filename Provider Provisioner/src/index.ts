import fs from 'fs/promises';
import path from 'path';
import { SpctlService } from './spctl/spctl.service';
import { createLogger } from './logger';
import { CRON_JOB_TIME, INPUT_DATA_FOLDER, LOG_LEVEL } from './config';
import { readAndValidateInput } from './read-and-validate-input';
import { handleInputOffer } from './handle-input-offer';
import { CronJob } from 'cron';

const logger = createLogger({
  options: {
    level: LOG_LEVEL,
  },
});

let isJobRunning = false;
const job = new CronJob(CRON_JOB_TIME, async () => {
  if (isJobRunning) {
    logger.info('Previous job is still running. Skipping this tick.');
    return;
  }

  isJobRunning = true;
  logger.info('Job started');

  try {
    const inputs = await fs.readdir(INPUT_DATA_FOLDER);

    for (const inputDir of inputs) {
      const log = logger.child({ inputDir });
      const { inputOffers, spctlConfigPath } = await readAndValidateInput(
        path.resolve(INPUT_DATA_FOLDER, inputDir),
      );

      const spctlService = new SpctlService({
        logger: log,
        locationPath: path.resolve(__dirname, '..', 'tools'),
        configPath: spctlConfigPath,
      });

      for (const inputOffer of inputOffers) {
        await handleInputOffer({
          inputOffer,
          spctlService,
          logger: log,
        });
      }
    }
  } catch (err) {
    logger.error({ err }, 'Failed to handle inputs');
  } finally {
    logger.info('Job finished');
    isJobRunning = false;
  }
});

job.start();
logger.info('Service started');

const signals = ['SIGTERM', 'SIGINT'];

for (const signal of signals) {
  process.on(signal, () => onSignalReceived(signal));
}

function onSignalReceived(signal: string): void {
  logger.info({ signal }, 'Signal received. Shutting down gracefully...');
  job.stop();
  process.exit(0);
}
