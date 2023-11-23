import {
  StorageAccess,
  StorjAdapter,
  StorjConfig,
  CacheEvents,
} from '@super-protocol/sdk-js';
import logger, { Logger } from '../../logger';
import { IClient } from './types';

export class StorjClientService<V extends object> implements IClient<StorjClientService<V>> {
  private _client: StorjAdapter<V> | null = null;
  private readonly logger: Logger;
  constructor() {
    this.logger = logger.child({ class: StorjClientService.name });
  }
  public async connect(storageAccess: StorageAccess, config: StorjConfig) {
    this._client = new StorjAdapter(storageAccess, config);
    return this;
  }

  public subscribe(cb: (props: { type: CacheEvents, message: any }) => void) {
    return this._client?.subscribe(cb);
  }
  public async get(key: string, encryptionKey: Buffer) {
    return this._client?.get(key, encryptionKey);
  }
  public async has(key: string) {
    return (!!this._client) && this._client.has(key);
  }
  public async set(key: string, value: V, encryptionKey: Buffer) {
    return this._client?.set(key, value, encryptionKey);
  }
  public async delete(key: string) {
    return this._client?.del(key);
  }
  public async close() {
    this._client?.stop();
    this._client = null;
  }
  public async shutdown() {
    await this._client?.shutdown();
  }
}
