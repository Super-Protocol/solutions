import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';

task('verify-app', 'Verify App contract')
    .addParam('address', 'App address')
    .addParam('oracle', 'Oracle argument')
    .setAction(async ({ address, oracle }, hre) => {
        try {
            await hre.run('verify:verify', {
                address,
                constructorArguments: [
                    oracle
                ],
            });
            console.log('Successfuly verified');
        } catch (e) {
            console.log(e);
        }
    });

task('verify-oracle', 'Verify App contract')
    .addParam('address', 'App address')
    .addParam('publishers', 'Publishers addresses (comma separated)')
    .addParam('verifier', 'Verifier smart-contract address')
    .addParam('enclave', 'Hash of application')
    .addParam('signer', 'mrSigner')
    .setAction(async ({
        address,
        publishers,
        verifier,
        enclave,
        signer
    }, hre) => {
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

        try {
            const publisherList: string[] = publishers.split(',');
            await hre.run('verify:verify', {
                address,
                constructorArguments: [
                    publisherList,
                    verifier,
                    enclave,
                    signer
                ],
            });
            console.log('Successfuly verified');
        } catch (e) {
            console.log(e);
        }
    });

