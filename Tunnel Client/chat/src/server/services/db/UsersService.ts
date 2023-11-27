import { CipherService, ICipherService } from '../../../common/services/CipherService';
import {
  UsersService as UsersServiceCommon, IUsersService as IUsersServiceCommon, UserDb, UserRequestProfile, UserInfo,
} from '../../../common/services/UsersService';
import { HelperService, IHelperService } from '../helper/HelperService';

export interface IUsersService extends IUsersServiceCommon {
  addUser(params: UserRequestProfile): Promise<UserDb>;
  addUsers(usersInfo: UserInfo[], connectPassword: string): Promise<UserDb[]>;
  createUser(params: UserRequestProfile): Promise<UserDb>;
  deleteUser(id: string): Promise<UserDb | null>;
  deleteUsers(ids: string[]): Promise<UserDb[]>;
}

export class UsersService extends UsersServiceCommon<IHelperService, ICipherService> {
  constructor() {
    super({ helperService: new HelperService(), cipherService: new CipherService() });
  }
  public async createUser(params: UserRequestProfile): Promise<UserDb> {
    const { userInfo, connectPassword } = params;
    const { token } = userInfo || {};
    if (!userInfo) throw new Error('Profile required');
    if (!token) throw new Error('Token required');
    if (!connectPassword) throw new Error('Password required');
    const createdAt = new Date().toISOString();
    const id = this._helpers.generateHash();
    const userBeforeSave = {
      id,
      name: this._helpers.textToBase64(userInfo.name),
      token: this._helpers.generateHash(token),
      createdAt,
      updatedAt: createdAt,
    };
    return userBeforeSave;
  }
  public async addUser(params: UserRequestProfile): Promise<UserDb> {
    const { userInfo, connectPassword } = params;
    if (!userInfo) throw new Error('Profile required');
    if (!connectPassword) throw new Error('Password required');
    const newUser = await this.createUser(params);
    this._users.push(newUser);
    return newUser;
  }
  public async addUsers(usersInfo: UserInfo[], connectPassword: string): Promise<UserDb[]> {
    if (!usersInfo?.length) return [];
    if (!connectPassword) throw new Error('Password required');
    const newUsers = await Promise.all(usersInfo.map(async (userInfo) => this.createUser({ userInfo, connectPassword })));
    this._users.push(...newUsers);
    return newUsers;
  }
  public async deleteUser(id: string): Promise<UserDb | null> {
    if (!id) throw new Error('User id required');
    const index = this._users.findIndex((user: UserDb) => user.id === id);
    if (index === -1) return null;
    const deletedUser = this._users.splice(index, 1)?.[0];
    return deletedUser || null;
  }
  public async deleteUsers(ids: string[]): Promise<UserDb[]> {
    if (!ids?.length) return this._users;
    const { newUsers, deletedUsers } = this._users.reduce((acc, user: UserDb) => {
      if (ids.includes(user.id)) {
        return {
          ...acc,
          deletedUsers: [...acc.deletedUsers, user],
        };
      }
      return {
        ...acc,
        newUsers: [...acc.newUsers, user],
      };
    }, { newUsers: [], deletedUsers: [] } as { newUsers: UserDb[]; deletedUsers: UserDb[] });
    this._users = newUsers;
    return deletedUsers;
  }
}