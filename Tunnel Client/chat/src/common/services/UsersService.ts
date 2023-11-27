import { ICipherService as ICipherServiceCommon } from './CipherService';
import { IHelperService as IHelperServiceCommon } from './HelperService';

export interface UserInfo {
  name: string;
  token: string;
}

export interface UserRequestProfile {
  userInfo: UserInfo;
  connectPassword: string;
}

export interface UserDb {
  id: string;
  name: string; // base64
  createdAt: string;
  updatedAt: string;
  token: string;
}

export interface UserResponse {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  token: string;
}

export interface IUsersService {
  users: UserDb[];
  setUsers(users: UserDb[]): IUsersService;
  getUsersDb(): UserDb[];
  getUserDbById(id: string): UserDb | null;
  getUsersDbByIds(ids: string[]): UserDb[];
  getUsersResponse(): UserResponse[];
  getUserResponseById(id: string): UserResponse | null;
  getUsersResponseByIds(ids: string[]): UserResponse[];
}

export class UsersService
<IHelperService extends IHelperServiceCommon, ICipherService extends ICipherServiceCommon>
implements IUsersService {
  protected _users: UserDb[] = [];
  protected _helpers: IHelperService;
  protected _cipherService: ICipherService;
  constructor(prop: { helperService: IHelperService, cipherService: ICipherService }) {
    const { helperService, cipherService } = prop || {};
    this._helpers = helperService;
    this._cipherService = cipherService;
  }
  public setUsers(users: UserDb[]): UsersService<IHelperService, ICipherService> {
    this._users = users;
    return this;
  }
  public getUsersDb(): UserDb[] {
    return this._users;
  }
  public getUsersResponse(): UserResponse[] {
    return this._users.map(({ name, ...rest }: UserDb) => ({
      ...rest,
      name: this._helpers.textFromBase64(name),
    }));
  }
  public getUserResponseById(id: string): UserResponse | null {
    if (!id) throw new Error('User id required');
    const user = this._users.find(({ id: userId }) => id === userId);
    if (!user) return null;
    return {
      ...user,
      name: this._helpers.textFromBase64(user?.name),
    };
  }
  public getUserDbById(id: string): UserDb | null {
    if (!id) throw new Error('User id required');
    const user = this._users.find(({ id: userId }) => id === userId);
    return user || null;
  }
  public getUsersResponseByIds(ids: string[]): UserResponse[] {
    if (!ids?.length) {
      throw new Error('Users ids are empty');
    }
    return this._users
      .filter((user: UserDb) => ids.includes(user.id))
      .map(({ name, ...rest }) => ({ ...rest, name: this._helpers.textFromBase64(name) }));
  }
  public getUsersDbByIds(ids: string[]): UserDb[] {
    if (!ids?.length) {
      throw new Error('Users ids are empty');
    }
    return this._users
      .filter((user: UserDb) => ids.includes(user.id));
  }
  public get users() {
    return this._users;
  }
}