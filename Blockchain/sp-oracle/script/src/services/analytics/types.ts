import { AnalyticsConfig } from '../../common/config';

export interface IAnalyticsOption extends Omit<AnalyticsConfig, 'enabled'> {
  userId: string;
}

export enum AnalyticEvent {
  ORACLE_REPORT = 'oracle_report',
}

export enum Platform {
  web = 'web',
  cli = 'cli',
  oracle = 'oracle',
}
