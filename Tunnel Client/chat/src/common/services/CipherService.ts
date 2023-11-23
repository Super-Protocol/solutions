import { Crypto } from '@super-protocol/sdk-js';
import { CryptoAlgorithm, Encoding } from '@super-protocol/dto-js/build/enum/index.js';
import { Cipher, Encryption } from '@super-protocol/dto-js';

export interface ICipherService {
  setPrivateKey(privateKey: string, type?: 'hex'): ICipherService;
  encrypt(content: string): Promise<Encryption>;
  decrypt(encryption: Encryption): Promise<string>;
}

export class CipherService implements ICipherService {
  private _privateKey = '';
  private generatePrivateKeyByType(privateKey: string, type = 'hex'): string {
    switch (type) {
      case 'hex':
        return Buffer.from(privateKey, 'hex').toString('base64');
      default:
        return privateKey;
    }
  }
  public setPrivateKey(privateKey: string, type = 'hex'): CipherService {
    this._privateKey = this.generatePrivateKeyByType(privateKey, type);
    return this;
  }
  public async encrypt(content: string): Promise<Encryption> {
    if (!this._privateKey) throw new Error('Private key required');
    return Crypto.encrypt(content, {
      algo: CryptoAlgorithm.AES,
      encoding: Encoding.base64,
      key: this._privateKey,
      cipher: Cipher.AES_256_GCM,
    });
  }
  public async decrypt(encryption: Encryption): Promise<string> {
    if (!this._privateKey) throw new Error('Private key required');
    if (!encryption) throw new Error('Encryption is not defined');
    encryption.key = this._privateKey;
    return Crypto.decrypt(encryption);
  }
}
