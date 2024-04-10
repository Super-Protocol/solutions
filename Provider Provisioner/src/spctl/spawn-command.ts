import { ChildProcessWithoutNullStreams, spawn } from 'child_process';
import { createLogger, ILogger } from '../logger';

export function spawnCommand(
  command: string,
  args: readonly string[],
  cwd: string,
  parentLogger?: ILogger,
): Promise<{ stdout: string; stderr: string; code: number }> {
  const logger = createLogger({
    parentLogger,
    bindings: {
      command,
      args: args.join(),
      cwd,
      module: 'spawn-command',
    },
  });
  const stderr: Buffer[] = [];
  const stdout: Buffer[] = [];
  const childProcess: ChildProcessWithoutNullStreams = spawn(command, args, { cwd });

  childProcess.stdout.on('data', (data: Buffer): void => {
    logger.trace(`stdout {\n ${data.toString()}\n}`);
    stdout.push(data);
  });

  childProcess.stderr.on('data', (data: Buffer) => {
    logger.trace(`stderr: ${data.toString()}`);
    stderr.push(data);
  });

  const bufferToString = (buf: Buffer[]): string => Buffer.concat(buf).toString('utf8');

  return new Promise<{ stdout: string; stderr: string; code: number }>((resolve, reject) => {
    childProcess.on('close', (code: number) => {
      logger.trace(`Child process exited with code ${code}`);

      resolve({
        stderr: bufferToString(stderr),
        stdout: bufferToString(stdout),
        code,
      });
    });

    childProcess.on('error', (err) => {
      logger.error({ err }, 'Error occurred:');
      reject(err);
    });
  });
}
