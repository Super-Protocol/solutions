import {
  IDbService, getClientService,
} from './clients/ClientService';
import { IClient } from './clients/types';
import { RoomsService } from './RoomsService';

export class DbService implements IDbService<DbService> {
  public rooms!: RoomsService;
  private client!: IClient;
  private _isConnected = false;
  private static instance: DbService | null;
  public static getInstance(): DbService {
    if (DbService.instance) {
      return DbService.instance;
    }
    DbService.instance = new DbService();
    return DbService.instance;
  }
  public get isConnected(): boolean {
    return this._isConnected;
  }
  public async connect(): Promise<DbService> {
    if (this.isConnected) return this;
    this.client = await getClientService();
    this.rooms = new RoomsService({ client: this.client });
    this._isConnected = true;
    return this;
  }
  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.close();
    }
  }

  public async shutdown(): Promise<void> {
    await this.client?.shutdown();
  }
}