import { IAnalyticsConfig } from '../../common/types';

export interface IAnalyticsOption extends Omit<IAnalyticsConfig, 'enabled'> {
  userId: string;
}

export enum AnalyticEvent {
  ORACLE_REPORT = 'oracle_report',
}

export interface IEventProperties {
  result: string;
  error?: string;
}

export enum Platform {
  web = 'web',
  cli = 'cli',
  oracle = 'oracle',
}
