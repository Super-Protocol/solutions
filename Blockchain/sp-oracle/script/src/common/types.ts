export type HttpResponse<Response> = {
  data: Response;
  status: number;
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
