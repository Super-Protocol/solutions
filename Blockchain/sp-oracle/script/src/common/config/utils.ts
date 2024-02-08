import { OracleConfig, OracleConfigSchema } from './types';

export const validate = (config: OracleConfig): OracleConfig => {
  try {
    return OracleConfigSchema.parse(config) as OracleConfig;
  } catch (err) {
    throw Error(`Validation config error: ${(err as Error).message}`);
  }
};

// export const setRuntimeDefaults = (target: Partial<Config>, sectionName: keyof Config): void => {
//   if (!ConfigLoader.validatedConfig) {
//   throw new Error(`Config is missing! Please run 'spctl setup' command`);
// }
//
// switch (sectionName) {
//   case 'analytics': {
//     const sectionConfig = target[sectionName] as Config['analytics'];
//     target[sectionName] = {
//       ...sectionConfig,
//       ...(!sectionConfig.spaUrl && {
//         spaUrl: this.getSpaUrlByBackendUrl(ConfigLoader.validatedConfig.backend.url),
//       }),
//     };
//     break;
//   }
//   default:
//     break;
// }
// }
//
// private getSpaUrlByBackendUrl(backendUrl: string): string {
//   const cluster = clusterRegexp.exec(backendUrl);
//
//   switch (cluster?.at(1)) {
//     case 'dev':
//       return 'https://spa.dev.superprotocol.com';
//     case 'stg':
//       return 'https://spa.stg.superprotocol.com';
//     case 'testnet':
//       return 'https://spa.superprotocol.com';
//
//     default:
//       return '';
//   }
// }
// }
