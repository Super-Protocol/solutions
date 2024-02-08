import { z } from 'zod';
import { DEFAULT_SPA_AUTH_KEY, DEFAULT_SPA_URL } from '../constants';

export const AnalyticsConfigSchema = z
  .object({
    enabled: z.coerce.boolean().default(true),
    logEnabled: z.coerce.boolean().default(false),
    spaAuthKey: z.coerce.string().default(DEFAULT_SPA_AUTH_KEY),
    spaUrl: z.coerce.string().default(DEFAULT_SPA_URL),
  })
  .default({});

export type AnalyticsConfig = z.infer<typeof AnalyticsConfigSchema>;

export const ApiAuthSchema = z.object({
  header: z.coerce.string(),
  key: z.coerce.string().min(1),
});

export const ApiConfigSchema = z.object({
  auth: ApiAuthSchema.optional(),
  endpoint: z.coerce.string().min(1),
});

export type ApiConfig = z.infer<typeof ApiConfigSchema>;

export const PublisherSchema = z.object({
  pk: z.coerce.string().min(1),
  address: z.coerce.string().min(1),
});

export const OracleConfigSchema = z.object({
  interval: z.coerce.number().int().positive(),
  dataKey: z.coerce.string().min(1),
  smartContractAddress: z.coerce.string().min(1),
  publisher: PublisherSchema,
  analytics: AnalyticsConfigSchema,
  apiConfig: ApiConfigSchema,
});

export type OracleConfig = z.infer<typeof OracleConfigSchema>;
