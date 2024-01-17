import { IApiService, IHttpsApiProvider } from '../common/intrefaces';
import { ApiConfig } from '../common/types';
import { AlphavantageApiExchangeRateType, AlphavantageApiRowDataType, ExchangeRateStructure } from '../dto/exchangeRate.dto';

import HttpsProvider from '../providers/https.provider';

class ExchangeApiService implements IApiService {
  private httpsProvider: IHttpsApiProvider;

  constructor(apiConfig: ApiConfig, rootCertificates: Buffer[]) {
    this.httpsProvider = new HttpsProvider(apiConfig, rootCertificates);
  }

  private static transformExchangeRate(input: AlphavantageApiExchangeRateType): ExchangeRateStructure {
    const rateString = input['5. Exchange Rate'].toString();
    const [, fraction] = rateString.split('.');
    const fractionLength = fraction ? fraction.length : 0;
    const denominator = Math.pow(10, fractionLength).toString();
    const numerator = rateString.replace('.', '');

    const apiTimestamp = Math.floor(new Date(input['6. Last Refreshed']).getTime() / 1000).toString();

    return {
      apiTimestamp,
      numerator,
      denominator,
    };
  }

  public async fetch(): Promise<object> {
    const rawData = await this.httpsProvider.get();
    console.log(`Data fetched from API: ${JSON.stringify(rawData.data)}`);

    const transformedData = ExchangeApiService.transformExchangeRate((rawData.data as AlphavantageApiRowDataType)['Realtime Currency Exchange Rate']);
    console.log(`Data transformed: ${JSON.stringify(transformedData)}`);

    return transformedData;
  }
}

export default ExchangeApiService;
