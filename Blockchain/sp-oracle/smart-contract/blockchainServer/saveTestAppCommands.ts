import { promises as fsPromise } from 'fs';

const testAppCommandsFile = `test-app-commands.txt`;

export const saveTestAppCommands = async (appContractAddress: string): Promise<string> => {
  const commands = [
    `npx hardhat process-a --address ${appContractAddress} --network localhost`,
    `npx hardhat process-b --address ${appContractAddress} --network localhost`,
  ];

  await fsPromise.writeFile(testAppCommandsFile, commands.join('\n'));

  return testAppCommandsFile;
};
