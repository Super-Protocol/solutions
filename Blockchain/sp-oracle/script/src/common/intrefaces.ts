import { HttpResponse, PublishData } from './types';
import { ChunkedSGXQuote } from '../dto/quote.dto';
import { ChunkedX509Cert } from '../dto/cert.dto';

export interface IHttpsApiProvider<ResponseData> {
  get(): Promise<HttpResponse<ResponseData>>;
}

export interface IApiService {
  fetch(): Promise<PublishData>;
}

export interface IBlockchainProvider {
  initSessionKey(): void;
  getSessionIdHash(): Buffer;
  applyNewSession(
    deviceCert: ChunkedX509Cert,
    intermediateCert: ChunkedX509Cert,
    parsedQuote: ChunkedSGXQuote,
  ): Promise<void>;
  publish(key: string, data: object): Promise<void>;
}

export interface IPubService {
  start(): Promise<void>;
  stop(): void;
}

export interface IQuoteProvider {
  initialize(): Promise<void>;
  genQuote(data: Buffer): Promise<Buffer>;
}

export interface IQuoteParser {
  parseQuote(): ChunkedSGXQuote;
  parseCerts(): ChunkedX509Cert[];
}
