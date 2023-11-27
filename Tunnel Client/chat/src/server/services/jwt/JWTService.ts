import jwt from 'jsonwebtoken';
import { Token } from './types';
import { HelperService } from '../helper/HelperService';
import { getConfig } from '../../config';

export class JWTService {
  private jwtSecret?: string;
  private helpers: HelperService = new HelperService();
  public setPrivateKey(jwtSecret: string): JWTService {
    this.jwtSecret = jwtSecret;
    return this;
  }
  public updateJwtSecret(jwtSecret: string): JWTService {
    this.jwtSecret = jwtSecret;
    return this;
  }
  public verify(token: string | undefined): Token {
    if (!token) throw new Error('Token is empty');
    const tokenWithoutBearer = token?.replace('Bearer ', '');
    if (!tokenWithoutBearer) {
      throw new Error('No token provided');
    }
    if (!this.jwtSecret) {
      throw new Error('jwt secret required');
    }
    try {
      return jwt.verify(tokenWithoutBearer, this.jwtSecret) as Token;
    } catch (e) {
      throw new Error('Invalid token');
    }
  }
  public decode(token?: string): Token {
    if (!token) throw new Error('Token is empty');
    try {
      return jwt.decode(token) as Token;
    } catch (e) {
      throw new Error('Decode token error');
    }
  }
  public sign(props: Token): string {
    if (!this.jwtSecret) {
      throw new Error('jwt secret required');
    }
    const {
      createdAt, roomName, userName, connectPassword,
    } = props || {};
    return jwt.sign(
      {
        createdAt, roomName, userName, connectPassword,
      },
      this.jwtSecret,
      { expiresIn: `${getConfig().jwt.expires}d` },
    );
  }
  public generateJwtKey(privateKey: string) {
    if (!privateKey) throw new Error('Private key required');
    return this.helpers.generateHash(privateKey);
  }
  public updateJwtKeyByPrivateKey(privateKey: string) {
    this.jwtSecret = this.generateJwtKey(privateKey);
  }
}