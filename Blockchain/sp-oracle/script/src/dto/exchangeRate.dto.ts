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
