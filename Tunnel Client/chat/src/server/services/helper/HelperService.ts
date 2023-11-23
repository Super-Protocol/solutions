import { createHash, randomUUID } from 'node:crypto';
import {
  IHelperService as IHelperServiceCommon,
  HelperService as HelperServiceCommon,
} from '../../../common/services/HelperService';

export interface IHelperService extends IHelperServiceCommon {
  generateHash(str?: string): string;
}
export class HelperService extends HelperServiceCommon implements IHelperService {
  public generateHash(str?: string) {
    return createHash('sha256').update(str || randomUUID()).digest('hex');
  }
}