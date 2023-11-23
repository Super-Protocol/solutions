import { CipherService } from '../../common/services/CipherService';
import { MessagesService as MessagesServiceCommon } from '../../common/services/MessagesService';
import { HelperService } from '../../common/services/HelperService';

export class MessagesService extends MessagesServiceCommon<HelperService, CipherService> {
  constructor() {
    super({ helperService: new HelperService(), cipherService: new CipherService() });
  }
}