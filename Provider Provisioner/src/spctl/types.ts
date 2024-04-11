import { ILogger } from '../logger';

export interface SpctlServiceParams {
  locationPath: string;
  configPath: string;
  logger: ILogger;
}

export enum OrderStatus {
  New = '0',
  Processing = '1',
  Canceling = '2',
  Canceled = '3',
  Done = '4',
  Error = '5',
  Blocked = '6',
  Suspended = '7',
}

export interface GetOrdersParams {
  limit: number;
  offerId: string;
  statuses: OrderStatus[];
}

export interface CompleteOrdersParams {
  orderIds: string[];
  status: OrderStatus.Done | OrderStatus.Error;
  resultPath: string;
}

export interface Order {
  id: string;
  status: string;
}
