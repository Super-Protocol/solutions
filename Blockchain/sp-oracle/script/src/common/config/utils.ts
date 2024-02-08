import { OracleConfig, OracleConfigSchema } from './types';

export const validate = (config: OracleConfig): OracleConfig => {
  try {
    return OracleConfigSchema.parse(config) as OracleConfig;
  } catch (err) {
    throw Error(`Validation config error: ${(err as Error).message}`);
  }
};
