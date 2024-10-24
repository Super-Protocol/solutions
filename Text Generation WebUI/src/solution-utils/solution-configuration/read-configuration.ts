import { TeeOrderEncryptedArgsConfiguration } from '@super-protocol/dto-js';
import { readFile } from 'fs/promises';
import { fileExists } from './utils';

export async function readConfiguration(
  configurationPath: string,
): Promise<TeeOrderEncryptedArgsConfiguration | null> {
  if (!(await fileExists(configurationPath))) {
    return null;
  }

  const configurationBuffer = await readFile(configurationPath);
  let configuration;
  try {
    configuration = JSON.parse(
      configurationBuffer.toString(),
    ) as TeeOrderEncryptedArgsConfiguration;
  } catch {
    throw new Error(`Configuration is not valid JSON`);
  }

  return configuration;
}
