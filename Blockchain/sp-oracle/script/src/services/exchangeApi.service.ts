import { IApiService, IHttpsApiProvider } from '../common/intrefaces';
import { ApiConfig } from '../common/types';
import { CoinApiExchangeRateType, ExchangeRateStructure } from '../dto/exchangeRate.dto';

import HttpsProvider from '../providers/https.provider';

class ExchangeApiService implements IApiService {
    private httpsProvider: IHttpsApiProvider;

    constructor(apiConfig: ApiConfig, rootCertificates: Buffer[]) {
        this.httpsProvider = new HttpsProvider(apiConfig, rootCertificates);
    }

    private static transformExchangeRate(input: CoinApiExchangeRateType)
    : ExchangeRateStructure {
        const xStr = input.rate.toString();
        const [, fraction] = xStr.split('.');
        const fractionLength = fraction ? fraction.length : 0;
        const denominator = Math.pow(10, fractionLength).toString();
        const numerator = xStr.replace('.', '');

        const apiTimestamp = Math.floor(new Date(input.time).getTime()/1000).toString();

        return {
            apiTimestamp,
            numerator,
            denominator,
        }
    }

    public async fetch(): Promise<Object> {
        const rawData = await this.httpsProvider.get();

        return ExchangeApiService.transformExchangeRate(rawData.data);
    }
}

export default ExchangeApiService;
