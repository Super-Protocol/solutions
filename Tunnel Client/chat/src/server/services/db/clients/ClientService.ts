import { performance } from 'node:perf_hooks';
import { StorageType } from '@super-protocol/dto-js';
import { Clients, IClient } from './types';
import { StorjClientService } from './StorjClientService';
import { RoomDb, IRoomsService } from '../RoomsService';
import { getConfig } from '../../../config';

export interface IDbService<Client = any> {
  rooms: IRoomsService;
  isConnected: boolean;
  connect(): Promise<IDbService<Client>>;
  disconnect(): Promise<void>;
  shutdown(): Promise<void>;
}

// key/value services
export const getClientService = async (): Promise<IClient> => {
  const config = getConfig();
  const client = config.CLIENT as Clients;
  const clientConfig = {
    ...config.DOWNLOADER,
    performance,
  };
  switch (client) {
    case Clients.STORJ:
      return new StorjClientService<RoomDb>().connect(
        {
          storageType: StorageType.StorJ,
          credentials: config.STORJ_CREDENTIALS,
        },
        clientConfig,
      );
    case Clients.S3:
      return new StorjClientService<RoomDb>().connect(
        {
          storageType: StorageType.S3,
          credentials: config.S3_CREDENTIALS,
        },
        clientConfig,
      );
    default:
      throw new Error(`Unknown client ${client}`);
  }
};
