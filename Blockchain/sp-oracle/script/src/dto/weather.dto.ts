export interface WeatherResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    relative_humidity_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
}

export const WeatherAbi = {
  PublishDataType: {
    apiTimestamp: 'uint32',
    numerator: 'uint256',
    denominator: 'uint256',
    nonce: 'uint32',
  },
};
