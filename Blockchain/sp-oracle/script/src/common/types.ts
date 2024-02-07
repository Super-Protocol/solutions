export type ApiAuth = {
  header: string;
  key: string;
};

export type ApiConfig = {
  endpoint: string;
  auth?: ApiAuth;
};

export type HttpResponse<Response> = {
  data: Response;
  status: number;
};

export interface IAnalyticsConfig {
  enabled?: boolean;
  logEnabled?: boolean;
  spaAuthKey: string;
  spaUrl: string;
}

export type OracleConfig = {
  interval: number;
  dataKey: string;
  smartContractAddress: string;
  publisher: {
    pk: string;
    address: string;
  };
  analytics?: IAnalyticsConfig;
  apiConfig: ApiConfig;
};

export type PemCert = {
  subjectPublicKeyInfo: {
    parsedKey: {
      x: string;
      y: string;
    };
  };
};

export interface PublishData {
  apiTimestamp: string;
  numerator: string;
  denominator: string;
  sign: boolean;
}

export interface TransactionData extends PublishData {
  nonce?: number;
}
