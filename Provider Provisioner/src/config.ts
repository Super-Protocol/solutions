import dotenv from 'dotenv';

dotenv.config();

function getEnvVar(envVarName: string): string | undefined {
  return process.env[envVarName];
}

function getRequiredEnvVar(envVarName: string): string {
  const val = getEnvVar(envVarName);

  if (val === undefined) {
    throw new Error(`Environment variable ${envVarName} is required`);
  }

  return val;
}

export const LOG_LEVEL = getEnvVar('LOG_LEVEL') || 'info';
export const INPUT_DATA_FOLDER = getRequiredEnvVar('INPUT_DATA_FOLDER');
export const CRON_JOB_TIME = getEnvVar('CRON_JOB_TIME') || '0 */5 * * * *';
