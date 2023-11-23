import { CipherService } from '../../common/services/CipherService';
import { UsersService as UsersServiceCommon } from '../../common/services/UsersService';
import { HelperService } from '../../common/services/HelperService';

export class UsersService extends UsersServiceCommon<HelperService, CipherService> {
  constructor() {
    super({ helperService: new HelperService(), cipherService: new CipherService() });
  }
}