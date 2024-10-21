import fs, {constants} from 'fs';
import { TeeOrderEncryptedArgsConfiguration } from "@super-protocol/dto-js";

export const isFileExisted = (filePath: string): Promise<boolean> =>
    fs.promises
      .access(filePath, constants.F_OK)
      .then(() => true)
      .catch(() => false);

export async function readConfiguration(configurationPath: string,): Promise<TeeOrderEncryptedArgsConfiguration | null> {
    if (!(await isFileExisted(configurationPath))) {
      return null;
    }

    const configurationBuffer = await fs.promises.readFile(configurationPath);
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
