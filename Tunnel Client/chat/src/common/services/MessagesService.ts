import { Encryption } from '@super-protocol/dto-js';
import { ICipherService as ICipherServiceCommon } from './CipherService';
import { IHelperService as IHelperServiceCommon } from './HelperService';

export type EncriptionMessage = string;

export interface MessageRequest {
  encryption: EncriptionMessage;
  senderName: string;
  senderId: string;
  messageClientId: string;
}

export interface MessageDb {
  id: string;
  encryption: string; // EncriptionMessage message string
  senderId: string;
  senderName: string; // base64
  createdAt: string;
  updatedAt: string;
  messageClientId: string;
}

export interface MessageResponse {
  id: string;
  message: string;
  senderId: string;
  senderName: string;
  createdAt: string;
  updatedAt: string;
  messageClientId: string;
}

export interface IMessagesService {
  messages: MessageDb[];
  setMessages(messages: MessageDb[]): IMessagesService;
  getMessagesDecrypted(connecedPassword: string): Promise<MessageResponse[]>;
  getMessageDecrypted(messageDb: MessageDb, connectPassword: string): Promise<MessageResponse | null>;
  getMessageDecryptedById(id: string, connectPassword: string): Promise<MessageResponse | null>;
  getMessage(id: string): Promise<MessageDb | null>;
  getMessages(ids: string[]): Promise<MessageDb[]>;
  encryptMessage(message: string, privateKey: string): Promise<Encryption>;
  decryptMessage(encription: Encryption, privateKey: string): Promise<EncriptionMessage>;
}

export class MessagesService
<IHelperService extends IHelperServiceCommon, ICipherService extends ICipherServiceCommon>
implements IMessagesService {
  protected _messages: MessageDb[] = [];
  protected _helpers: IHelperService;
  protected _cipher: ICipherService;
  private readonly undecryptedMessageText = 'This message cannot be decrypted';
  constructor(prop: { helperService: IHelperService, cipherService: ICipherService }) {
    const { helperService, cipherService } = prop || {};
    this._helpers = helperService;
    this._cipher = cipherService;
  }
  public async encryptMessage(message: string, privateKey: string): Promise<Encryption> {
    if (!message) throw new Error('Message required for encription service');
    if (typeof message !== 'string') throw new Error('Message must be string');
    if (!privateKey) throw new Error('Private key required for encription service');
    return this._cipher.setPrivateKey(privateKey).encrypt(Buffer.from(message, 'utf-8').toString('binary'));
  }
  public async decryptMessage(encryption: Encryption, privateKey: string): Promise<EncriptionMessage> {
    if (!encryption) throw new Error('Encription required for encription service');
    if (!privateKey) throw new Error('Private key required for encription service');
    return Buffer.from(await this._cipher.setPrivateKey(privateKey).decrypt(encryption), 'binary').toString('utf-8');
  }
  public setMessages(messages: MessageDb[]): MessagesService<IHelperService, ICipherService> {
    this._messages = messages;
    return this;
  }
  public async getMessagesDecrypted(connectPassword: string): Promise<MessageResponse[]> {
    return Promise.all(this.messages.map(async ({ encryption, senderName, ...rest }: MessageDb) => {
      const message = await this.decryptMessage(JSON.parse(encryption), connectPassword).catch(() => this.undecryptedMessageText);
      return {
        ...rest,
        message,
        senderName: this._helpers.textFromBase64(senderName),
      };
    }));
  }
  public async getMessageDecrypted(messageDb: MessageDb, connectPassword: string): Promise<MessageResponse | null> {
    if (!connectPassword) throw new Error('Password required');
    if (!messageDb) return null;
    const { encryption, senderName, ...rest } = messageDb;
    const message = await this.decryptMessage(JSON.parse(encryption), connectPassword).catch(() => this.undecryptedMessageText);
    return {
      ...rest,
      message,
      senderName: this._helpers.textFromBase64(senderName),
    };
  }
  public async getMessageDecryptedById(id: string, connectPassword: string): Promise<MessageResponse | null> {
    if (!connectPassword) throw new Error('Password required');
    if (!id) throw new Error('Message id required');
    const messageFromDb = this._messages.find((message: MessageDb) => message.id === id);
    if (!messageFromDb) return null;
    return this.getMessageDecrypted(messageFromDb, connectPassword);
  }
  public async getMessage(id: string): Promise<MessageDb | null> {
    if (!id) throw new Error('Message id required');
    const message = this._messages.find((message: MessageDb) => message.id === id);
    return message || null;
  }
  public async getMessages(ids: string[]): Promise<MessageDb[]> {
    if (!ids?.length) return [];
    const messages = this._messages.filter((message: MessageDb) => !ids.includes(message.id));
    return messages || [];
  }
  public get messages() {
    return this._messages;
  }
}