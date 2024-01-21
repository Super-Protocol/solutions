import { spawn } from 'child_process';
import { Account, parseAccounts } from './parseKey';

export const startBlockChain = (): Promise<Account> => {
  return new Promise((resolve, reject) => {
    let output = '';
    let accounts: Account[] = [];

    const blockchainProcess = spawn('npx', ['hardhat', 'node'], {
      env: {
        PATH: process.env.PATH,
        MUMBAI_URL: 'MUMBAI_URL',
        LOCALHOST_DEPLOYER_PRIVATE_KEY:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
        MUMBAI_DEPLOYER_PRIVATE_KEY:
          '0x0000000000000000000000000000000000000000000000000000000000000001',
      },
    });

    blockchainProcess.stdout?.on('data', (data: Buffer) => {
      const message: string = data.toString();
      output = output.concat(message);
      if (/Account #9/.test(message)) {
        accounts = parseAccounts(output);
        resolve(accounts[0]);
      }
    });

    blockchainProcess.stderr?.on('data', (data: Buffer) => console.error(data.toString()));
    blockchainProcess.on('error', (error) => {
      console.error(`[BlockchainController] Got error from blockchain: ${error}`);

      reject(error);
    });
    blockchainProcess.on('close', () => {
      reject(new Error('Process closed before ready'));
    });
  });
};
