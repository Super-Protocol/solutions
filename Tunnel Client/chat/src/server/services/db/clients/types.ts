import {
  StorageAccess, CacheEvents, StorjConfig,
} from '@super-protocol/sdk-js';

export enum Clients {
  ORBITDB = 'ORBITDB',
  STORJ = 'STORJ',
  S3 = 'S3',
}

export interface IClient<Service = any> {
  get: (key: string, password: Buffer) => Promise<any>;
  has: (key: string) => Promise<boolean>;
  set: (key: string, value: any, password: Buffer) => Promise<void>;
  delete: (key: string) => Promise<void>;
  close(): Promise<void>;
  connect(storageAccess: StorageAccess, config: StorjConfig): Promise<Service>;
  subscribe(cb: (props: { type: CacheEvents, message: any }) => void): void;
  shutdown(): Promise<void>;
}
