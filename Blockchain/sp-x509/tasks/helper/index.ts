import { Contract, Signer } from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

export const deployContract = async (
    hre: HardhatRuntimeEnvironment,
    name: string, signer: Signer,
    ...args: any[]
): Promise<Contract> => {
    console.log(name, 'start deploy...');
    const factory = await hre.ethers.getContractFactory(name, signer);
    const contract = await factory.deploy(...args);;
    await contract.deployed();

    // This solves the bug in Mumbai network where the contract address is not the real one
    const txHash = contract.deployTransaction.hash;
    console.log('Waiting for transaction to be mined. TxHash:', txHash);
    await hre.ethers.provider.waitForTransaction(txHash);
    return contract;
}