import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { deployContract } from './helper';

task('deploy-app', 'Deploy app contract')
    .addParam('oracle', 'Oracle address')
    .addParam('verifier', 'Verifier address')
    .setAction(async ({ oracle, verifier }, hre) => {
        const signers = await hre.ethers.getSigners();
        const deployer = signers[0];

        const app = await deployContract(
            hre,
            'App',
            deployer,
            oracle,
            verifier
        );

        console.log('App address:', app.address);
    });
