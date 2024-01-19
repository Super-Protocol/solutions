import { Socket, Server } from 'socket.io';
import PQueue from 'p-queue';
import { getConfig } from '../../config';
import { JWTService } from '../jwt/JWTService';
import { Queue } from '../queue';
import baseLogger, { Logger } from '../logger';
import { getRoomName } from './utils';
import {
  IDbService,
} from '../db/clients/ClientService';
import { SocketUsersIdentify } from './SocketUsersIdentify';
import { Sockets, SocketServiceConstructor } from './types';
import { UserDb } from '../../../common/services/UsersService';
import { MessageDb } from '../../../common/services/MessagesService';
import { RoomStatus } from '../../../common/types';
import { RoomDb, RoomsEvents } from '../db/RoomsService';
import { UsersService } from '../db/UsersService';

export class SocketService {
  private readonly db: IDbService;
  private readonly sockets: Sockets = {};
  private readonly socketUsersIdentify: SocketUsersIdentify;
  public readonly io: Server;
  private readonly queue: Queue;
  private readonly logger: Logger;
  private maxMessagesBytes: number;
  private dbRoomsSubscriptions?: (() => Promise<void>);
  constructor({
    db, io,
  }: SocketServiceConstructor) {
    const MAX_BYTES_IN_UTF_8 = 6;
    const MAX_MESSAGE_BYTES = (+getConfig().MAX_MESSAGE_SYMBOLS || 0) * MAX_BYTES_IN_UTF_8;
    this.maxMessagesBytes = MAX_MESSAGE_BYTES;
    this.logger = baseLogger.child({ class: SocketService.name });
    this.socketUsersIdentify = new SocketUsersIdentify();
    this.queue = new Queue();
    this.db = db;
    this.io = io;
    this.initMiddleware();
    this.initDbSubscriptions();
    io.on('connection', this.addSocket.bind(this));
  }
  private parseSocketToken(socket: Socket): any {
    try {
      const { token } = socket.handshake?.query || {};
      if (!token) throw new Error('Invalid token');
      const { connectPassword } = new JWTService().decode(token as string);
      return { ...new JWTService().setPrivateKey(connectPassword).verify(token as string), token };
    } catch (err) {
      this.logger.error({ err }, 'check auth token');
      throw new Error('Invalid token');
    }
  }
  private useAuth(socket: Socket, next: (err?: Error) => void) {
    try {
      this.parseSocketToken(socket);
      next();
    } catch (e) {
      next((e as Error));
    }
  }
  private initMiddleware() {
    this.io.use(this.useAuth.bind(this));
  }
  private async removeDbSubscriptions(): Promise<void> {
    if (this.dbRoomsSubscriptions) this.dbRoomsSubscriptions();
  }
  private async initDbSubscriptions(): Promise<void> {
    this.removeDbSubscriptions();
    const dbRoomsSubscriber = async (props: { type: RoomsEvents, message: any }) => {
      const { type, message } = props;
      this.logger.info({ type }, 'db event');
      switch (type) {
        case RoomsEvents.ROOM_DELETE:
          return this.onDeleteRoomDb.call(this, message);
        case RoomsEvents.USER_ADD:
          return this.onUserAddToRoomDb.call(this, message);
        case RoomsEvents.USERS_UPDATE:
          return this.onUsersUpdateInRoomDb.call(this, message);
        case RoomsEvents.USER_DELETE:
          return this.onUserDeleteFromRoomDb.call(this, message);
        case RoomsEvents.MESSAGE_ADD:
          return this.onMessageAddDb.call(this, message);
        case RoomsEvents.MESSAGES_ADD:
          return this.onMessagesAddDb.call(this, message);
        default:
          return null;
      }
    };
    this.dbRoomsSubscriptions = await this.db.rooms.subscribe(
      (props) => this.queue.enqueue(() => dbRoomsSubscriber.call(this, props)),
    );
  }
  public addSocket(socket: Socket): void {
    if (!socket) return;
    const socketSubscriptions = {
      message: (payload: { encryption: string; messageClientId: string; }) => this.queue.enqueue(
        () => this.onMessageSocket.call(this, socket, payload),
      ),
      leaveRoom: () => this.queue.enqueue(() => this.onLeaveRoomSocket.call(this, socket)),
      joinRoom: (name: string) => this.queue.enqueue(() => this.onJoinRoomSocket.call(this, socket, name)),
      disconnecting: () => this.queue.enqueue(() => this.onDisconnectingSocket.call(this, socket)),
      error: (error: Error) => this.onError.call(this, socket, error),
    };
    socket.on('message', socketSubscriptions.message);
    socket.on('joinRoom', socketSubscriptions.joinRoom);
    socket.on('leaveRoom', socketSubscriptions.leaveRoom);
    socket.on('disconnecting', socketSubscriptions.disconnecting);
    socket.on('error', socketSubscriptions.error);
    socket.use((_, next) => this.useAuth.call(this, socket, next));
    this.sockets[socket.id] = {
      socket,
      subscriptions: socketSubscriptions,
    };
  }
  private removeSocket(socketId: string): void {
    if (!socketId) return;
    const socket = this.sockets[socketId];
    if (!socket) return;
    socket.socket.off('message', socket.subscriptions.message);
    socket.socket.off('joinRoom', socket.subscriptions.joinRoom);
    socket.socket.off('leaveRoom', socket.subscriptions.leaveRoom);
    socket.socket.off('disconnecting', socket.subscriptions.disconnecting);
    socket.socket.off('error', socket.subscriptions.error);
    delete this.sockets[socketId];
  }
  private async onDeleteRoomDb(props: { room: RoomDb; roomId: string }): Promise<void> {
    try {
      if (!this.sockets) throw new Error('sockets required');
      const { roomId } = props || {};
      if (!roomId) throw new Error('room id required');
      const roomName = getRoomName(roomId);
      const isRoomExists = await this.db.rooms.isRoomExists(roomId).catch(() => false);
      if (isRoomExists) throw new Error('room exists');
      Object.values(this.sockets).forEach((socket) => {
        if (socket.socket.rooms.has(roomName)) {
          socket.socket.emit('deleteRoom');
          socket.socket.leave(roomName);
        }
      });
      this.socketUsersIdentify.deleteUsersByRoomId(roomId);
      this.logger.info({ roomId }, 'delete room db');
    } catch (err) {
      this.logger.error({ err }, 'delete room db');
    }
  }
  private onError(socket: Socket, err: Error): void {
    if (err && err.message === 'Invalid token') {
      this.logger.info({ socketId: socket?.id }, 'On error socket. Invalid token. Disconnect socket');
      socket.disconnect();
    }
    this.logger.error({ err }, 'On error socket');
  }
  private async onDisconnectingSocket(socket: Socket): Promise<void> {
    try {
      if (!socket?.id) throw new Error('socket id required');
      this.logger.info({ socketId: socket?.id }, 'socket start disconnecting');
      this.removeSocket(socket.id);
      const user = this.socketUsersIdentify.getUserBySocketId(socket.id);
      if (!user) {
        this.logger.info({ socketId: socket?.id }, 'socket already disconnected');
        return;
      }
      const { roomId, id } = user;
      if (!id) throw new Error('user id required');
      if (!roomId) throw new Error('user room id required');
      const roomName = getRoomName(roomId);
      socket.to(roomName).emit('leaveRoom', [user.id]);
      this.socketUsersIdentify.deleteUserBySocketId(socket.id);
      const isRoomExists = await this.db.rooms.isRoomExists(roomId).catch(() => false);
      if (!isRoomExists) {
        this.logger.info({ socketId: id, roomId }, 'Room does not exists. Skip delete user');
        return;
      }
      const { connectPassword } = this.parseSocketToken(socket);
      if (!connectPassword) throw new Error('Password required');
      await this.db.rooms.deleteUserFromRoom(id, connectPassword);
    } catch (err) {
      this.logger.error({ err }, 'disconnecting socket');
    }
  }
  private async onLeaveRoomSocket(socket: Socket): Promise<void> {
    try {
      if (!socket) throw new Error('socket required');
      const { connectPassword } = this.parseSocketToken(socket);
      if (!connectPassword) throw new Error('connect password required');
      const roomId = this.db.rooms.getRoomIdByConnectPassword(connectPassword);
      socket.leave(getRoomName(roomId));
      this.logger.info({ socketId: socket?.id, roomId }, 'leave from socket');

      const isRoomExists = await this.db.rooms.isRoomExists(roomId).catch(() => false);
      if (!isRoomExists) {
        this.logger.info({ socketId: socket.id }, 'Room does not exists. Skip delete user');
        return;
      }
      const user = this.socketUsersIdentify.getUserBySocketId(socket.id);
      if (!user?.id) throw new Error('user id required');
      await this.db.rooms.deleteUserFromRoom(user.id, connectPassword);
    } catch (err) {
      this.logger.error({ err }, 'leave room socket');
    }
  }
  private async onJoinRoomSocket(socket: Socket, name: string): Promise<void> {
    try {
      if (!socket) throw new Error('socket required');
      if (!name) throw new Error('profile name required');
      if (name.length > getConfig().MAX_USER_NAME_SYMBOLS) {
        throw new Error(`Name must be less than ${getConfig().MAX_USER_NAME_SYMBOLS} characters`);
      }
      const { connectPassword, token } = this.parseSocketToken(socket);
      if (!connectPassword) throw new Error('connectPassword required');
      const userInfo = {
        name,
        token,
      };
      const roomId = this.db.rooms.getRoomIdByConnectPassword(connectPassword);
      if (!roomId) throw new Error('roomId required');
      const room = await this.db.rooms.getRoomFromAllInstances(connectPassword);
      if (!room) throw new Error('room required');
      let savedUser = null;
      const usersInRoom = this.socketUsersIdentify.getUsersByRoomId(roomId);
      // drop users in db after restart server instance
      if (!usersInRoom.length) {
        savedUser = await this.db.rooms.replaceUsersInRoomByNewUser({ userInfo, connectPassword });
      } else {
        savedUser = await this.db.rooms.addUserToRoom({ userInfo, connectPassword });
      }
      if (!savedUser) throw new Error('user required');
      const roomName = getRoomName(roomId);
      socket.join(roomName);
      this.socketUsersIdentify.addUserBySocketId(socket.id, { roomId, id: savedUser.id });

      socket.emit('getCurrentUser', savedUser);
      socket.emit('getRoomStatus', RoomStatus.AVAILABLE);
      socket.emit('getRoomUsers', room.users);
      this.logger.info({ socketId: socket?.id, roomId }, 'join room socket');
    } catch (err) {
      this.logger.error({ err }, 'join room socket');
      socket.disconnect();
    }
  }
  private async onUserAddToRoomDb(props: { user: UserDb; roomId: string; }) {
    try {
      const { user, roomId } = props || {};
      if (!user) throw new Error('user is not defined');
      if (!roomId) throw new Error('roomId required');
      const roomName = getRoomName(roomId);
      Object.values(this.sockets).forEach((socket) => {
        if (socket.socket.rooms.has(roomName)) {
          socket.socket.emit('newUserJoinedToRoom', user);
        }
      });
      this.logger.info({ roomId, userId: user?.id }, 'user add to roomdb');
    } catch (err) {
      this.logger.error({ err }, 'user add to room db');
    }
  }
  private async onUsersUpdateInRoomDb(props: { users: UserDb[], roomId: string }) {
    try {
      const { users, roomId } = props || {};
      if (!roomId) throw new Error('roomId required');
      const roomName = getRoomName(roomId);
      Object.values(this.sockets).forEach((socket) => {
        if (socket.socket.rooms.has(roomName)) {
          socket.socket.emit('usersUpdatedInRoom', users);
        }
      });
      this.logger.info({ roomId, count: users.length }, 'users updated in roomdb');
    } catch (err) {
      this.logger.error({ err }, 'users updated in room db');
    }
  }
  private async onUserDeleteFromRoomDb(props: { user: UserDb; roomId: string; }) {
    const { user, roomId } = props || {};
    try {
      const socketId = this.socketUsersIdentify.getUserSocketId(user.id);
      if (!socketId) {
        this.logger.info({ roomId, userId: user?.id }, 'already leave from room');
        return;
      }
      const roomName = getRoomName(roomId);
      Object.values(this.sockets).forEach((socket) => {
        if (socket.socket.rooms.has(roomName)) {
          socket.socket.emit('leaveRoom', [user.id]);
        }
      });
      this.socketUsersIdentify.deleteUserBySocketId(socketId);
      this.logger.info({ roomId, socketId }, 'leave from db');
    } catch (err) {
      this.logger.error({ err }, 'leave room db');
    }
  }
  private async onMessageSocket(socket: Socket, payload: { encryption: string; messageClientId: string; }) {
    try {
      if (!payload) throw new Error('message payload required');
      if (!socket) throw new Error('socket required');
      const { encryption, messageClientId } = payload || {};
      if (!encryption) throw new Error('message required');
      if (!messageClientId) throw new Error('message client id required');
      const { connectPassword } = this.parseSocketToken(socket);
      if (!connectPassword) throw new Error('connect password required');
      const messageLen = Buffer.from(JSON.parse(encryption).ciphertext, 'base64')?.length;
      if (this.maxMessagesBytes && messageLen > this.maxMessagesBytes) {
        throw new Error(`Message must be less than ${this.maxMessagesBytes} bytes. Message length: ${messageLen} bytes.`);
      }
      const user = this.socketUsersIdentify.getUserBySocketId(socket.id);
      if (!user) throw new Error('User required');
      const userFromDb = await this.db.rooms.getUserByIdInRoom(connectPassword, user.id);
      if (!userFromDb) throw new Error('User required');
      const userResponse = new UsersService().setUsers([userFromDb]).getUserResponseById(userFromDb.id);
      if (!userResponse) throw new Error('User required');
      const newMessage = {
        encryption,
        senderName: userResponse.name,
        senderId: userResponse.id,
        messageClientId: messageClientId || '',
      };
      await this.db.rooms.addMessageToRoom(newMessage, connectPassword);
      this.logger.info({ socketId: socket.id }, 'message socket');
    } catch (err) {
      this.logger.error({ err }, 'message socket');
    }
  }
  private async onMessageAddDb(props: { message: MessageDb; roomId: string; }) {
    try {
      const { message, roomId } = props || {};
      if (!message) throw new Error('message required');
      const roomName = getRoomName(roomId);
      Object.values(this.sockets).forEach((socket) => {
        if (socket.socket.rooms.has(roomName)) {
          socket.socket.emit('message', message);
        }
      });
      this.logger.info({ roomId }, 'message db');
    } catch (err) {
      this.logger.error({ err }, 'message db');
    }
  }
  private async onMessagesAddDb(props: { messages: MessageDb[]; roomId: string; }) {
    try {
      const { messages, roomId } = props || {};
      if (!messages?.length) throw new Error('messages required');
      const roomName = getRoomName(roomId);
      Object.values(this.sockets).forEach((socket) => {
        if (socket.socket.rooms.has(roomName)) {
          socket.socket.emit('messages', messages);
        }
      });
      this.logger.info({ roomId }, 'message db');
    } catch (err) {
      this.logger.error({ err }, 'message db');
    }
  }
  public async removeUsersBySockets() {
    const logger = this.logger.child({ method: this.removeUsersBySockets.name });
    try {
      if (this.socketUsersIdentify.users.size) {
        const rooms = this.socketUsersIdentify.getRooms();
        const queue = new PQueue({ concurrency: 1 });
        rooms.forEach((roomId) => {
          const connectPassword = this.db.rooms.passwords.get(roomId);
          if (!connectPassword) logger.info({ roomId }, 'Password is empty. Skip delete users');
          if (connectPassword) {
            queue.add(async () => {
              await this.db.rooms.deleteAllUsers(connectPassword);
              this.socketUsersIdentify.deleteUsersByRoomId(roomId);
              logger.info({ roomId }, 'Success remove users from room');
            });
          }
        });
        await queue.onIdle();
      } else {
        logger.info({ size: this.socketUsersIdentify.users.size }, 'The list of user sockets is empty. skip delete');
      }
    } catch (err) {
      logger.error({ err }, 'remove users by sockets');
    }
  }
}
