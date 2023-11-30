import '@nomiclabs/hardhat-ethers';
import { task } from 'hardhat/config';
import { parsePem } from '../test/helper';
import path from 'path';
import fs from 'fs';

task('verify-x509', 'Deploy verfivicator contract')
    .addParam('cert', 'Root cert path')
    .addParam('address', 'Address of verifier contract')
    .setAction(async ({ cert, address }, hre) => {
        const fullPath: string = path.join(process.cwd(), cert);
        const rootCert = fs.readFileSync(fullPath, 'utf-8');
        const rootParsed = parsePem(rootCert);

        try {
            await hre.run('verify:verify', {
                address,
                constructorArguments: [
                    rootParsed
                ],
            });
            console.log('Successfuly verified');
        } catch (e) {
            console.log('Verification failed with reason: ', e);
        }
    });
