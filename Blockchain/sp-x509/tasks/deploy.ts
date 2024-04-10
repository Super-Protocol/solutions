import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { deployContract } from './helper';
import { parsePem } from '../test/helper';
import path from 'path';
import fs from 'fs';

task('deploy', 'Deploy verfivicator contract')
    .addParam('cert', 'Root cert path')
    .setAction(async ({ cert }, hre) => {
        const signers = await hre.ethers.getSigners();
        const deployer = signers[0];

        const fullPath: string = path.join(process.cwd(), cert);
        const rootCert = fs.readFileSync(fullPath, 'utf-8');
        const rootParsed = parsePem(rootCert);

        const app = await deployContract(
            hre,
            'Verifier',
            deployer,
            rootParsed,
        );

        console.log('Verifier contract address:', app.address);
    });
