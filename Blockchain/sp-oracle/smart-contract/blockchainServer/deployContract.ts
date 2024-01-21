import { promisify } from 'util';
import { exec as execCallback } from 'child_process';

const execPromise = promisify(execCallback);

export const deployContract = async (command: string): Promise<string> => {
  const result = await execPromise(command);

  if (result.stderr) {
    throw new Error(`Deploy contract ${command} error: ${result.stderr}`);
  }

  const address = result.stdout.match(/(?<=address: )0x[0-9a-fA-F]{40}/g);
  if (!address?.[0]) {
    throw new Error(`Contact address is missing! Output: ${result.stdout}`);
  }

  return address[0];
};
