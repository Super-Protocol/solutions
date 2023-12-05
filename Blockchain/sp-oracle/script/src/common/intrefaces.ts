import { HttpResponse } from './types';
import { ChunkedSGXQuote } from '../dto/quote.dto';
import { ChunkedX509Cert } from '../dto/cert.dto';

export interface IHttpsApiProvider {
  get(): Promise<HttpResponse>;
}

export interface IApiService {
  fetch(): Promise<object>;
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
  genQuote(data: Buffer): Promise<Buffer>;
}

export interface IQuoteParser {
  parseQuote(): ChunkedSGXQuote;
  parseCerts(): ChunkedX509Cert[];
}
