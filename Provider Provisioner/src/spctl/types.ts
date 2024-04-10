/* eslint-disable @typescript-eslint/no-explicit-any */
import { ILogger } from '../logger';

export interface SpctlServiceParams {
  locationPath: string;
  configPath: string;
  logger: ILogger;
}

export enum OrderStatus {
  New = 'new',
  Processing = 'processing',
  Canceling = 'canceling',
  Canceled = 'canceled',
  Done = 'done',
  Error = 'error',
  Blocked = 'blocked',
  Suspended = 'suspended',
}

export interface GetOrdersParams {
  limit: number;
  offerId: string;
  status: OrderStatus;
}

export interface CompleteOrderParams {
  orderId: string;
  status: OrderStatus.Done | OrderStatus.Error;
  resultPath: string;
}

export interface Order {
  id: string;
  status: string;
}
