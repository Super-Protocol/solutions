import { Analytics, NodeEventProvider } from '@super-protocol/sdk-js';
import { AnalyticsEvent, Config } from '@super-protocol/sdk-js/build/analytics/types';
import { IAnalyticsOption, Platform } from './types';

let instance: Analytics<AnalyticsEvent> | null = null;

export const createAnalyticsService = (
  options: Required<IAnalyticsOption>,
): Analytics<AnalyticsEvent> => {
  if (!instance) {
    const config: Config<AnalyticsEvent> = {
      apiUrl: options.spaUrl,
      apiKey: options.spaAuthKey,
      eventProvider: new NodeEventProvider({
        userId: options.userId,
        platform: Platform.oracle,
      }),
      showLogs: Boolean(options.logEnabled),
    };

    instance = new Analytics(config);
  }

  return instance;
};
