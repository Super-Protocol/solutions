import { IApiService, IHttpsApiProvider } from '../common/intrefaces';
import { ApiConfig, PublishData } from '../common/types';
import { getDenominator } from '../common/utils';
import { WeatherResponse } from '../dto/weather.dto';
import HttpsProvider from '../providers/https.provider';

class WeatherApiService implements IApiService {
  private httpsProvider: IHttpsApiProvider<WeatherResponse>;

  constructor(apiConfig: ApiConfig, rootCertificates: Buffer[]) {
    this.httpsProvider = new HttpsProvider(apiConfig, rootCertificates);
  }

  async fetch(): Promise<PublishData> {
    const response = await this.httpsProvider.get();

    console.log(`Data fetched from API: ${JSON.stringify(response.data)}`);

    return this.transformToPublishData(response.data);
  }

  private transformToPublishData(weatherResponse: WeatherResponse): PublishData {
    const temperature = String(weatherResponse.current.temperature_2m);
    const sign = !temperature.startsWith('-');
    const numerator = temperature.replace(/[-.]/g, '');
    const denominator = getDenominator(temperature);
    const apiTimestamp = Math.floor(
      new Date(weatherResponse.current.time).getTime() / 1000,
    ).toString();

    return {
      apiTimestamp,
      numerator,
      denominator,
      sign,
    };
  }
}

export default WeatherApiService;
