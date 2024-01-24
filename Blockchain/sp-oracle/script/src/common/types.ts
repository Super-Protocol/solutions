export type ApiAuth = {
  header: string;
  key: string;
};

export type ApiConfig = {
  endpoint: string;
  auth?: ApiAuth;
};

export type HttpResponse = {
  data: object;
  status: number;
};

export type OracleConfig = {
  interval: number;
  dataKey: string;
  smartContractAddress: string;
  publisher: {
    pk: string;
    address: string;
  };
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

export type PublicData = {
  nonce?: number;
};
