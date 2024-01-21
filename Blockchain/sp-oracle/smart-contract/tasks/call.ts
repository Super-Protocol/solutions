import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';

task('process-a', 'Call method processA()')
    .addParam('address', 'App address')
    .setAction(async ({ address }, hre) => {
        const signers = await hre.ethers.getSigners();
        const caller = signers[0];

        const app = await hre.ethers.getContractAt('App', address);
        const answer = await app.connect(caller).processA();

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

task('change-mr-enclave', 'Change mrEnclave')
    .addParam('address', 'Oracle address')
    .addParam('enclave', 'New mrEnclave')
    .setAction(async ({ address, enclave }, hre) => {
        const signers = await hre.ethers.getSigners();
        const caller = signers[0];

        if (enclave.length == 64) {
            enclave = '0x' + enclave;
        }

        if (enclave.length !== 66) {
            throw Error('Invalid mrEnclave size');
        }

        const oracle = await hre.ethers.getContractAt('Publisher', address);
        await oracle.connect(caller).updateMrEnclave(enclave);

        console.log('MrEnclave updated');
    });

task('change-mr-signer', 'Change mrSigner')
    .addParam('address', 'Oracle address')
    .addParam('signer', 'New mrSigner')
    .setAction(async ({ address, signer }, hre) => {
        const signers = await hre.ethers.getSigners();
        const caller = signers[0];

        if (signer.length == 64) {
            signer = '0x' + signer;
        }

        if (signer.length !== 66) {
            throw Error('Invalid mrSigner size');
        }

        const oracle = await hre.ethers.getContractAt('Publisher', address);
        await oracle.connect(caller).updateMrSigner(signer);

        console.log('MrSigner updated');
    });
