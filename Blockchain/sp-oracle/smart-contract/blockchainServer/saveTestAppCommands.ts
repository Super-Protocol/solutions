export const getTestAppCommands = (appContractAddress: string): string[] => {
  return [
    `npx hardhat process-a --address ${appContractAddress} --network localhost`,
    `npx hardhat process-b --address ${appContractAddress} --network localhost`,
  ];
};
