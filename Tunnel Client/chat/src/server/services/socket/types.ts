import { Socket, Server } from 'socket.io';
import { IDbService } from '../db/clients/ClientService';

export interface SocketSubscriptions {
  message: (...args: any[]) => void;
  leaveRoom: (...args: any[]) => void;
  joinRoom: (...args: any[]) => void;
  disconnecting: (...args: any[]) => void;
  error: (...args: any[]) => void;
}

export interface Sockets {
  [id: string]: { socket: Socket, subscriptions: SocketSubscriptions }
}

export interface SocketServiceConstructor {
  db: IDbService;
  io: Server;
}