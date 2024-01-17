/*
 Data example:
 {
  "time": "2023-08-23T10:02:16.0000000Z",
  "asset_id_base": "BTC",
  "asset_id_quote": "USD",
  "rate": 24074.026939464020613775374598
 }
*/
export type CoinApiExchangeRateType = {
  time: string;
  asset_id_base: string;
  asset_id_quote: string;
  rate: number;
};

export type AlphavantageApiRowDataType = {
  'Realtime Currency Exchange Rate': AlphavantageApiExchangeRateType,
};

export type AlphavantageApiExchangeRateType = {
    '1. From_Currency Code': string,
    '2. From_Currency Name': string,
    '3. To_Currency Code': string,
    '4. To_Currency Name': string,
    '5. Exchange Rate': string,
    '6. Last Refreshed': string,
    '7. Time Zone': string,
    '8. Bid Price': string,
    '9. Ask Price': string,
};

export type ExchangeRateStructure = {
  apiTimestamp: number | string;
  numerator: number | string;
  denominator: number | string;
  nonce?: number;
};

export const ExchangeRateAbi = {
  RateDataType: {
    apiTimestamp: 'uint32',
    numerator: 'uint256',
    denominator: 'uint256',
    nonce: 'uint32',
  },
};
