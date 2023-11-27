import { DbService } from './DbService';
import { IDbService } from './clients/ClientService';
import { GlobalRef } from '../globalRef';

const dbRef = new GlobalRef<IDbService<DbService>>('db'); // nextjs doesn't share instance between routers :/

if (!dbRef.value) {
  dbRef.value = DbService.getInstance();
}

export const db: IDbService<DbService> = dbRef.value;
