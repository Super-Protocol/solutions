import { randomBytes } from 'crypto';
import { stdout } from 'process';

export const generatePrivateKey = (): string => randomBytes(32).toString('base64');

export const generateSecrets = () => {
  return {
    PRIVATE_ENCRYPTION_KEY: generatePrivateKey(),
  };
};

stdout.write(JSON.stringify(generateSecrets()));
