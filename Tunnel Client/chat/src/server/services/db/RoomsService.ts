import { CacheEvents } from '@super-protocol/sdk-js';
import { generateMnemonic } from '../../utils/crypto';
import { HelperService } from '../helper/HelperService';
import { MessagesService } from './MessagesService';
import { UsersService } from './UsersService';
import PubSub from '../PubSub';
import { JWTService } from '../jwt';
import {
  MessageRequest,
  MessageDb,
} from '../../../common/services/MessagesService';
import {
  UserDb,
  UserRequestProfile,
} from '../../../common/services/UsersService';
import logger, { Logger } from '../logger';

export interface CreateRoomResponse extends RoomDb {
  connectPassword: string;
  deletePassword: string;
}

export interface IClient {
  get: (key: string, password: Buffer) => Promise<RoomDb[] | null>;
  has: (key: string) => Promise<boolean>;
  set: (key: string, value: RoomDb, password: Buffer) => Promise<void>;
  delete: (key: string) => Promise<void>;
  subscribe(cb: (props: { type: CacheEvents, message: any }) => void): void;
}

export interface RoomsServiceConstructor {
  client: IClient;
}

export interface RoomDb {
  users: UserDb[];
  messages: MessageDb[];
  createdAt: string;
  updatedAt: string;
  name: string;
}

export enum RoomsEvents {
  ROOM_DELETE = 'ROOM_DELETE',
  MESSAGE_ADD = 'MESSAGE_ADD',
  MESSAGES_ADD = 'MESSAGES_ADD',
  USER_ADD = 'USER_ADD',
  USERS_UPDATE = 'USERS_UPDATE',
  USER_DELETE = 'USER_DELETE'
}

export interface IRoomsService {
  createRoom(roomName: string): Promise<CreateRoomResponse>;
  getRoomToken(connectPassword: string, userName: string): Promise<string>;
  getRoomIdByConnectPassword(connectPassword: string): string;
  getRoomFromCurrentInstance(connectPassword: string): Promise<RoomDb | null>;
  getRoomFromAllInstances(connectPassword: string): Promise<RoomDb | null>;
  deleteRoom(deletePassword: string): Promise<boolean>;
  // permissions
  isRoomExists(roomId: string): Promise<boolean>;
  // users
  addUserToRoom(params: UserRequestProfile): Promise<UserDb>;
  deleteUserFromRoom(userId: string, connectPassword: string): Promise<boolean>;
  getUserByIdInRoom(connectPassword: string, userId: string): Promise<UserDb | null>;
  replaceUsersInRoomByNewUser(params: UserRequestProfile): Promise<UserDb>;
  deleteAllUsers(connectPassword: string): Promise<void>;
  // messages
  addMessageToRoom(message: MessageRequest, connectPassword: string): Promise<boolean>;

  subscribe(cb: (props: { type: RoomsEvents, message: any }) => void): Promise<() => Promise<void>>;
  publish(type: RoomsEvents, message: any): void;

  passwords: Map<string, string>; // roomId/connectPassword
}

export class RoomsService implements IRoomsService {
  private readonly helpers: HelperService = new HelperService();
  private readonly client: IClient;
  private readonly pubSub: PubSub<string, any> = new PubSub();
  private readonly eventName = 'rooms';
  private readonly messageSevice: MessagesService = new MessagesService();
  private readonly usersService: UsersService = new UsersService();
  private readonly logger: Logger;
  public readonly passwords = new Map<string, string>();
  constructor({ client }: RoomsServiceConstructor) {
    this.client = client;
    this.logger = logger.child({ class: RoomsService.name });
    this.usersService = new UsersService();
    const cb = async ({ type, message: roomId }: { type: CacheEvents, message: any }) => {
      switch (type) {
        case CacheEvents.INSTANCES_CHANGED:
          this.onInstancesChanged(roomId);
          break;
        case CacheEvents.KEY_DELETED:
          this.publish(RoomsEvents.ROOM_DELETE, { room: null, roomId });
          break;
        default:
          break;
      }
    };
    this.client.subscribe((props) => cb.call(this, props));
  }
  public async subscribe(cb: (props: { type: RoomsEvents, message: any }) => void): Promise<() => Promise<void>> {
    this.pubSub.subscribe(this.eventName, cb);
    return async () => {
      this.pubSub.unsubscribe(this.eventName, cb);
    };
  }
  public publish<T = string>(type: T, message: any) {
    this.pubSub.publish(this.eventName, { type, message });
  }
  public async createRoom(roomName: string): Promise<CreateRoomResponse> {
    const deletePassword = generateMnemonic();
    const connectPassword = this.helpers.generateHash(deletePassword);
    const createdAt = new Date().toISOString();
    const params = {
      messages: [],
      users: [],
      createdAt,
      updatedAt: createdAt,
      name: this.helpers.textToBase64(roomName),
    };
    await this.updateRoom(connectPassword, params);
    return {
      ...params,
      connectPassword,
      deletePassword,
    };
  }
  private async updateRoom(connectPassword: string, content: RoomDb): Promise<void> {
    if (!connectPassword) throw new Error('Password required');
    const roomId = this.helpers.generateHash(connectPassword);
    this.passwords.set(roomId, connectPassword);
    await this.client.set(roomId, content, this.helpers.bufferFromHex(connectPassword));
  }
  public getRoomIdByConnectPassword(connectPassword: string): string {
    if (!connectPassword) throw new Error('Password required');
    const roomId = this.helpers.generateHash(connectPassword);
    if (!roomId) throw new Error('Room is not defined');
    return roomId;
  }
  private getConnectPasswordByDeletePassword(deletePassword: string): string {
    if (!deletePassword) throw new Error('Password required');
    return this.helpers.generateHash(deletePassword);
  }
  public getRoomIdByDeletePassword(deletePassword: string): string {
    if (!deletePassword) throw new Error('Password required');
    return this.helpers.generateHash(this.getConnectPasswordByDeletePassword(deletePassword));
  }
  public async getRoomFromAllInstances(connectPassword: string): Promise<RoomDb | null> {
    if (!connectPassword) {
      throw new Error('Password required');
    }
    const roomId = this.getRoomIdByConnectPassword(connectPassword);
    const instances = await this.client.get(roomId, this.helpers.bufferFromHex(connectPassword));
    if (!instances?.length) return null;
    this.passwords.set(roomId, connectPassword);

    return this.mergeRooms(instances) || null;
  }
  public async getRoomFromCurrentInstance(connectPassword: string): Promise<RoomDb | null> {
    if (!connectPassword) {
      throw new Error('Password required');
    }
    const roomId = this.getRoomIdByConnectPassword(connectPassword);
    const instances = await this.client.get(roomId, this.helpers.bufferFromHex(connectPassword));
    const hasNonNullInstances = instances?.some((instance) => !!instance);

    if (!instances || !hasNonNullInstances) return null;

    const firstInstance = instances[0];
    if (!firstInstance) { // save room if not found
      const mergedInstance = this.mergeRooms(instances) as RoomDb;
      const newDecryptedRoomForCurrentInstance = {
        ...mergedInstance,
        users: [],
      };
      await this.updateRoom(connectPassword, newDecryptedRoomForCurrentInstance);
      return newDecryptedRoomForCurrentInstance;
    }

    this.passwords.set(roomId, connectPassword);

    // merging messages is potentially redundant
    if (this.hasUnmergedMessages(firstInstance, instances)) {
      firstInstance.messages = this.mergeMessages(instances.map((instance) => instance.messages));
    }
    return firstInstance;
  }
  public async getRoomToken(connectPassword: string, userName: string): Promise<string> {
    if (!connectPassword) throw new Error('Password required');
    if (!userName) throw new Error('User name required');
    const room = await this.getRoomFromCurrentInstance(connectPassword); // do not need to merge
    if (!room) throw new Error('Room is not defined');
    const { createdAt, name } = room;
    return new JWTService().setPrivateKey(connectPassword).sign({
      createdAt,
      roomName: this.helpers.textFromBase64(name),
      userName,
      connectPassword,
    });
  }
  public async deleteRoom(deletePassword: string): Promise<boolean> {
    if (!deletePassword) throw new Error('Delete password required');
    const roomId = this.getRoomIdByDeletePassword(deletePassword);
    const connectPassword = this.getConnectPasswordByDeletePassword(deletePassword);
    const room = await this.getRoomFromCurrentInstance(connectPassword);
    if (!room) throw new Error('Room is not defined');
    await this.client.delete(roomId);
    this.publish(RoomsEvents.ROOM_DELETE, { room, roomId });
    return true;
  }
  public async replaceUsersInRoomByNewUser(params: UserRequestProfile): Promise<UserDb> {
    return this.addUserToRoom(params, true);
  }
  public async addUserToRoom(params: UserRequestProfile, replace = false): Promise<UserDb> {
    const { connectPassword, userInfo } = params;
    if (!userInfo?.name) throw new Error('User name required');
    if (!connectPassword) throw new Error('Password required');
    const roomId = this.getRoomIdByConnectPassword(connectPassword);
    const room = await this.getRoomFromCurrentInstance(connectPassword);
    if (!room) throw new Error('Room is not defined');
    this.usersService.setUsers(replace ? [] : room.users);
    const newUser = await this.usersService.addUser(params);
    await this.updateRoom(connectPassword, {
      ...room,
      users: this.usersService.users,
      updatedAt: new Date().toISOString(),
    });
    this.publish(RoomsEvents.USER_ADD, { user: newUser, roomId });
    return newUser;
  }
  public async addMessageToRoom(message: MessageRequest, connectPassword: string): Promise<boolean> {
    if (!connectPassword) throw new Error('Password required');
    const roomId = this.getRoomIdByConnectPassword(connectPassword);
    const room = await this.getRoomFromCurrentInstance(connectPassword);
    if (!room) return false;
    this.messageSevice.setMessages(room?.messages);
    const savedMessage = await this.messageSevice.addMessage(message, connectPassword);
    await this.updateRoom(connectPassword, {
      ...room,
      messages: this.messageSevice.messages,
      updatedAt: new Date().toISOString(),
    });
    this.publish(RoomsEvents.MESSAGE_ADD, { message: savedMessage, roomId });
    return true;
  }
  public async getUserByIdInRoom(connectPassword: string, userId: string): Promise<UserDb | null> {
    if (!connectPassword) throw new Error('Password id required');
    const room = await this.getRoomFromCurrentInstance(connectPassword);
    return ((room?.users || []) as UserDb[]).find(({ id }) => id === userId) || null;
  }
  public async deleteUserFromRoom(userId: string, connectPassword: string): Promise<boolean> {
    if (!userId) throw new Error('User id required');
    const roomId = this.getRoomIdByConnectPassword(connectPassword);
    const room = await this.getRoomFromCurrentInstance(connectPassword);
    if (!room) throw new Error('Room is not defined');
    this.usersService.setUsers(room?.users);
    const deletedUser = this.usersService.deleteUser(userId);
    await this.updateRoom(connectPassword, {
      ...room,
      users: this.usersService.users,
      updatedAt: new Date().toISOString(),
    });

    this.publish(RoomsEvents.USER_DELETE, { user: deletedUser, roomId });
    return true;
  }
  private async onInstancesChanged(roomId: string) {
    const connectPassword = this.passwords.get(roomId);
    if (!connectPassword) {
      this.logger.info({ roomId }, 'Password not found');
      return;
    }
    const updatedMessagesAndUsers = await this.getUpdatedMessagesAndUsers(connectPassword);
    if (!updatedMessagesAndUsers) return;
    const { messagesAdded, usersAll } = updatedMessagesAndUsers;
    if (messagesAdded.length) {
      this.publish(RoomsEvents.MESSAGES_ADD, { messages: messagesAdded, roomId });
    }
    this.publish(RoomsEvents.USERS_UPDATE, { users: usersAll, roomId });
  }
  private async getUpdatedMessagesAndUsers(connectPassword: string): Promise<{
    usersAll: UserDb[];
    messagesAdded: MessageDb[];
  } | null> {
    if (!connectPassword) throw new Error('Password id required');
    const roomId = this.getRoomIdByConnectPassword(connectPassword);
    const instances = await this.client.get(roomId, this.helpers.bufferFromHex(connectPassword));
    if (!instances) return null;
    const [currentInstance, ...otherInstances] = instances;
    if (!currentInstance) return null;
    if (!otherInstances?.length) return null;
    const messagesAdded = this.findAddedMessages(
      currentInstance.messages,
      otherInstances.flatMap((instance) => instance?.messages || []),
    );
    const usersAll = this.mergeUsers([currentInstance.users, otherInstances.flatMap((instance) => instance?.users || [])]);
    return {
      messagesAdded,
      usersAll,
    };
  }
  public async isRoomExists(roomId: string): Promise<boolean> {
    return this.client.has(roomId);
  }
  private findAddedMessages(currMessages: MessageDb[], allMessages: MessageDb[]): MessageDb[] {
    const map = new Set(currMessages.map((copy) => copy?.id));
    return allMessages.filter((newMessage) => !map.has(newMessage?.id));
  }
  private hasUnmergedMessages(firstInstance: RoomDb, otherInstances: RoomDb[]): boolean {
    const firstInstanceMessagesUpdate = new Date(firstInstance.messages.at(-1)?.updatedAt || 0).getTime();

    const someInstancesUpdated = otherInstances.some((instance) => {
      const otherInstanceMessagesUpdate = new Date(instance.messages.at(-1)?.updatedAt || 0).getTime();

      return otherInstanceMessagesUpdate > firstInstanceMessagesUpdate;
    });
    return someInstancesUpdated;
  }
  private mergeRooms(copies: (RoomDb | null)[]): RoomDb | null {
    if (!copies?.length) {
      return null;
    }
    const result = copies.filter((room) => !!room)[0]; // find the first null room
    if (!result) return null;
    return {
      ...result,
      messages: this.mergeMessages(copies.map((copy) => copy?.messages || [])),
      users: this.mergeUsers(copies.map((copy) => copy?.users || [])),
    };
  }
  private mergeMessages(copies: MessageDb[][]): MessageDb[] {
    const map = new Map(copies.flat().map((copy) => ([copy.id, copy])));
    return Array.from(map.values()).sort((a, b) => {
      if (a?.createdAt === b?.createdAt) {
        return a.id > b.id ? 1 : -1;
      }
      return new Date(a?.createdAt).getTime() - new Date(b?.createdAt).getTime();
    });
  }
  private mergeUsers(copies: UserDb[][]): UserDb[] {
    const map = new Map(copies.flat().map((copy) => ([copy.id, copy])));
    return Array.from(map.values());
  }
  public async deleteAllUsers(connectPassword: string): Promise<void> {
    if (!connectPassword) throw new Error('Password id required');
    const room = await this.getRoomFromCurrentInstance(connectPassword);
    if (!room) return;
    await this.updateRoom(connectPassword, {
      ...room,
      users: [],
    });
  }
}
