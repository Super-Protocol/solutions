import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';

task('process-a', 'Call method processA()')
    .addParam('address', 'App address')
    .setAction(async ({ address }, hre) => {
        const signers = await hre.ethers.getSigners();
        const caller = signers[0];

        const app = await hre.ethers.getContractAt('App', address);
        const answer = await app.connect(caller).processA().call();

        console.log('Tx result:', answer);
    });

    task('process-b', 'Call method processB()')
    .addParam('address', 'App address')
    .setAction(async ({ address }, hre) => {
        const signers = await hre.ethers.getSigners();
        const caller = signers[0];

        const app = await hre.ethers.getContractAt('App', address);
        const answer = await app.connect(caller).processB();

        console.log('Tx result:', answer);
    });
