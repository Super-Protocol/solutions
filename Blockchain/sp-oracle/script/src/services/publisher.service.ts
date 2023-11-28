import BlockchainProvider from '../providers/blockchain.provider';

import { IApiService, IQuoteProvider, IBlockchainProvider, IPubService } from '../common/intrefaces';
import { ExchangeRateAbi } from "../dto/exchangeRate.dto";
import { OracleConfig } from '../common/types';

class PublisherService implements IPubService {
    blockchainProvider: IBlockchainProvider;
    quoteProvider: IQuoteProvider;
    apiService: IApiService;
    interval: number;
    dataKey: string;

    constructor(
        nodeUrl: string,
        config: OracleConfig,
        apiService: IApiService,
        quoteProvider: IQuoteProvider
    ) {
        this.interval = config.interval;
        this.quoteProvider = quoteProvider;
        this.blockchainProvider = new BlockchainProvider(
            nodeUrl,
            config.smartContractAddress,
            config.publisher.pk,
            config.publisher.address,
        );
        this.apiService = apiService;
        this.dataKey = config.dataKey;
    }

    private async oracleLoop(): Promise<void> {
        const data = await this.apiService.fetch();
        const dataBuffer = Buffer.from(JSON.stringify(data));
        const quote = await this.quoteProvider.genQuote(dataBuffer);
        const formattedData = this.blockchainProvider.formatObject(data, ExchangeRateAbi);
        this.blockchainProvider.publish(this.dataKey, formattedData, quote);
    }

    public async startOracleLoop(): Promise<NodeJS.Timer> {
        await this.oracleLoop();
        console.log('Loop has been started');

        return setInterval(
            async () => await this.oracleLoop(),
            this.interval * 1000,
        );
    }
}

export default PublisherService;
