import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { deployContract } from './helper';
import { ethers } from 'ethers';

task('deploy-oracle', 'Deploy oracle contract')
    .addParam('publishers', 'Publishers addresses (comma separated)')
    .addParam('hash', 'Hash of application')
    .setAction(async ({ publishers, hash }, hre) => {
        const signers = await hre.ethers.getSigners();
        const deployer = signers[0];
        const publisherList: string[] = publishers.split(',');
        const prepearedAppHash = ethers.utils.formatBytes32String(hash);

        console.log('publisherList', publisherList);
        const oracle = await deployContract(
            hre,
            'Oracle',
            deployer,
            publisherList,
            prepearedAppHash
        );

        console.log('Oracle address:', oracle.address);
    });
