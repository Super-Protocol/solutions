import { v1 as uuid, validate } from 'uuid';
import { CipherService } from '../../../common/services/CipherService';
import {
  MessagesService as MessagesServiceCommon,
  IMessagesService as IMessagesServiceCommon,
  MessageRequest,
  MessageDb,
} from '../../../common/services/MessagesService';
import { HelperService } from '../helper/HelperService';

export interface IMessagesService extends IMessagesServiceCommon {
  createMessage(message: MessageRequest, connectPassword: string): Promise<MessageDb>;
  addMessage(message: MessageRequest, connectPassword: string): Promise<MessageDb>;
  deleteMessage(id: string): Promise<MessageDb | null>;
  deleteMessages(ids: string[]): Promise<MessageDb[]>;
}

export class MessagesService extends MessagesServiceCommon<HelperService, CipherService> {
  constructor() {
    super({ helperService: new HelperService(), cipherService: new CipherService() });
  }
  public async createMessage(data: MessageRequest, connectPassword: string): Promise<MessageDb> {
    if (!connectPassword) throw new Error('Password required');
    const {
      encryption,
      senderName,
      senderId,
      messageClientId,
    } = data;
    if (!encryption) throw new Error('Encryption required');
    if (!validate(messageClientId)) {
      throw new Error('Bad client id');
    }
    const createdAt = new Date().toISOString();
    const id = uuid();
    const messageBeforeSave: MessageDb = {
      encryption,
      id,
      createdAt,
      updatedAt: createdAt,
      senderName: this._helpers.textToBase64(senderName),
      senderId,
      messageClientId,
    };
    return messageBeforeSave;
  }
  public async deleteMessage(id: string): Promise<MessageDb | null> {
    if (!id) throw new Error('User id required');
    const index = this._messages.findIndex((user: MessageDb) => user.id === id);
    if (index === -1) return null;
    const message = this._messages.splice(index, 1)?.[0];
    return message || null;
  }
  public async deleteMessages(ids: string[]): Promise<MessageDb[]> {
    if (!ids?.length) return this._messages;
    const { newMessages, deletedMessages } = this._messages.reduce((acc, user: MessageDb) => {
      if (ids.includes(user.id)) {
        return {
          ...acc,
          deletedMessages: [...acc.deletedMessages, user],
        };
      }
      return {
        ...acc,
        newMessages: [...acc.newMessages, user],
      };
    }, { newMessages: [], deletedMessages: [] } as { newMessages: MessageDb[]; deletedMessages: MessageDb[] });
    this._messages = newMessages;
    return deletedMessages;
  }
  public async addMessage(data: MessageRequest, connectPassword: string): Promise<MessageDb> {
    if (!connectPassword) throw new Error('Password required');
    const newMessage = await this.createMessage(data, connectPassword);
    this._messages.push(newMessage);
    return newMessage;
  }
}