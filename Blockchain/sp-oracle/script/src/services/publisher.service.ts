import BlockchainProvider from '../providers/blockchain.provider';
import QuoteParser from './quoteParser.service';

import {
  IApiService,
  IQuoteProvider,
  IBlockchainProvider,
  IPubService,
} from '../common/intrefaces';
import { OracleConfig } from '../common/config';
import { getAnalyticsErrorEventProperties, getErrorMessage } from '../common/utils';
import { Analytics } from '@super-protocol/sdk-js';
import { AnalyticsEvent } from '@super-protocol/sdk-js/build/analytics/types';
import { AnalyticEvent } from './analytics';

class PublisherService implements IPubService {
  shutdown: boolean;
  blockchainProvider: IBlockchainProvider;
  interval: number;
  dataKey: string;

  constructor(
    nodeUrl: string,
    config: OracleConfig,
    readonly apiService: IApiService,
    readonly quoteProvider: IQuoteProvider,
    private readonly analytics?: Analytics<AnalyticsEvent>,
  ) {
    this.quoteProvider = quoteProvider;
    this.blockchainProvider = new BlockchainProvider(
      nodeUrl,
      config.smartContractAddress,
      config.publisher.pk,
      config.publisher.address,
    );
    this.apiService = apiService;
    this.dataKey = config.dataKey;
    this.interval = config.interval;
    this.shutdown = false;
  }

  private async oracleLoop(): Promise<void> {
    const data = await this.apiService.fetch();
    await this.blockchainProvider.publish(this.dataKey, data);
    console.log('The iteration of oracle loop has been ended');
  }

  private async startSession(): Promise<void> {
    this.blockchainProvider.initSessionKey();
    const sessionKeyHash = this.blockchainProvider.getSessionIdHash();
    const rawQuote = await this.quoteProvider.genQuote(sessionKeyHash!);
    const quoteParser = new QuoteParser(rawQuote);
    const parsedQuote = quoteParser.parseQuote();
    const [deviceCert, intermediateCert] = quoteParser.parseCerts();

    await this.blockchainProvider.applyNewSession(deviceCert, intermediateCert, parsedQuote);
  }

  public async start(): Promise<void> {
    let hasBeenCompletedSuccessfully = false;
    const loop = async (): Promise<void> => {
      if (!this.shutdown) {
        try {
          await this.oracleLoop();
          if (!hasBeenCompletedSuccessfully) {
            await this.analytics?.trackEventCatched({
              eventName: AnalyticEvent.ORACLE_REPORT,
              eventProperties: { result: 'success' },
            });
            hasBeenCompletedSuccessfully = true;
          }
        } catch (err) {
          const errorMessage = getErrorMessage(err);
          await this.analytics?.trackEventCatched({
            eventName: AnalyticEvent.ORACLE_REPORT,
            eventProperties: getAnalyticsErrorEventProperties(errorMessage),
          });
          console.log(errorMessage);
        } finally {
          setTimeout(loop, this.interval * 1000);
        }
      }
    };

    await this.startSession();
    await loop();
  }

  public stop(): void {
    this.shutdown = true;
  }
}

export default PublisherService;
