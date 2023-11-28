import { HttpResponse } from './types';

export interface IHttpsApiProvider {
    get(): Promise<HttpResponse>;
}

export interface IApiService {
    fetch(): Promise<any>;
}

export interface IQuoteProvider {
    genQuote(data: Buffer): Promise<Buffer>;
}

export interface IBlockchainProvider {
    formatObject(data: any, abi: object): string;
    publish(key: string, data: string, quote: Buffer): Promise<void>;
}

export interface IPubService {
    startOracleLoop(key: string, api: IApiService): Promise<NodeJS.Timer>;
}