import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { deployContract } from './helper';

task('deploy-app', 'Deploy app contract')
    .addParam('oracle', 'Oracle address')
    .setAction(async ({ oracle }, hre) => {
        const signers = await hre.ethers.getSigners();
        const deployer = signers[0];

        const app = await deployContract(
            hre,
            'App',
            deployer,
            oracle,
        );

        console.log('App address:', app.address);
    });

task('deploy-mock', 'Deploy mock contract')
    .setAction(async (args, hre) => {
        const signers = await hre.ethers.getSigners();
        const deployer = signers[0];

        const app = await deployContract(
            hre,
            'PublisherMock',
            deployer,
        );

        console.log('Publisher mock address:', app.address);
    });

task('deploy-oracle', 'Deploy oracle contract')
    .addParam('publishers', 'Publishers addresses (comma separated)')
    .addParam('verifier', 'Verifier smart-contract address')
    .addParam('enclave', 'Hash of application')
    .addParam('signer', 'mrSigner')
    .setAction(async ({ publishers, verifier, enclave, signer }, hre) => {
        const signers = await hre.ethers.getSigners();
        const deployer = signers[0];
        const publisherList: string[] = publishers.split(',');

        if (signer.length == 64) {
            signer = '0x' + signer;
        }

        if (signer.length !== 66) {
            throw Error('Invalid mrSigner size');
        }

        if (enclave.length == 64) {
            enclave = '0x' + enclave;
        }

        if (enclave.length !== 66) {
            throw Error('Invalid mrEnclave size');
        }

        const oracle = await deployContract(
            hre,
            'Oracle',
            deployer, 
            publisherList,
            verifier,
            enclave,
            signer,
        );

        console.log('Oracle address:', oracle.address);
    });
