import fs from 'fs';
import path from 'path';

import PublisherService from './services/publisher.service';
import WeatherApiService from './services/weatherApi.service';

import { OracleConfig, validate } from './common/config';
import { HTTPS_NODE_URL } from './common/constants';

import { getErrorMessage } from './common/utils';
import { getQuoteProvider } from './providers/quote/getQuoteProvider';
import { AnalyticEvent, createAnalyticsService } from './services/analytics';

let analytics: ReturnType<typeof createAnalyticsService> | undefined;

async function start(): Promise<void> {
  const inputDir = process.env.INPUT_DATA_FOLDER;
  if (!inputDir) throw new Error('Env variable INPUT_DATA_FOLDER is not defined');

  let rootCertificates: Buffer[] = [];
  let configDir: string, configData;
  const ls = fs.readdirSync(inputDir);
  for (const dirName of ls) {
    try {
      configDir = path.join(inputDir, dirName);
      const inputPath = path.join(configDir, 'input.json');
      configData = fs.readFileSync(inputPath, { encoding: 'utf8', flag: 'r' });
      rootCertificates = fs
        .readdirSync(configDir)
        .filter((fileName) => fileName.endsWith(`.crt`))
        .map((certName) => fs.readFileSync(path.join(configDir, certName)));

      break;
    } catch (err: unknown) {
      console.warn(
        `Something went wrong during reading data from "${dirName}" directory. Errir: ${
          (err as Error).message
        }`,
      );
    }
  }

  if (!configData) throw new Error("Input file doesn't exist");
  const config: OracleConfig = validate(JSON.parse(configData));
  console.log('Input extracted');

  if (config.analytics?.enabled) {
    // Disclaimer: we collect simple anonymous analytics for this Oracle solution for troubleshooting purposes.
    // It returns a value of whether this Oracle was deployed successfully or not. You can delete it, if you'd like.
    analytics = createAnalyticsService({
      ...config.analytics,
      userId: config.publisher.address,
    });
  }

  const btcUsdRateApi = new WeatherApiService(config.apiConfig, rootCertificates);
  console.log('Exchange rate service created');

  const quoteProvider = getQuoteProvider();
  await quoteProvider.initialize();
  console.log('Quote provider created');

  const pubService = new PublisherService(
    HTTPS_NODE_URL,
    config,
    btcUsdRateApi,
    quoteProvider,
    analytics,
  );
  console.log('Blockchain service initialized');

  await pubService.start();
}

start().catch(async (err: Error) => {
  const errorMessage = getErrorMessage(err);
  await analytics?.trackEventCatched({
    eventName: AnalyticEvent.ORACLE_REPORT,
    eventProperties: {
      result: 'error',
      error: errorMessage,
    },
  });
  console.log(errorMessage);
});
