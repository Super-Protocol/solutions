export const getEnvValueOrFail = (envName: string): string => {
  const value = process.env[envName];
  if (!value) {
    throw new Error(`Env value ${envName} is missing`);
  }

  return value;
};
