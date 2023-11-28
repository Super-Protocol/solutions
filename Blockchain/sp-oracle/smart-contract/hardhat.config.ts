import '@typechain/hardhat';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';
import { config } from './config';
import { utils } from 'ethers';

import './tasks/deployApp';
import './tasks/deployOracle';
import './tasks/callApp';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    solidity: {
        version: '0.8.9',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        hardhat: {
            chainId: 1337,
            mining: {
                auto: true,
            },
            gasPrice: 1,
            initialBaseFeePerGas: 1,
            accounts: {
                accountsBalance: utils.parseEther('100000000').toString(),
                count: 10,
            },
            gas: 30_000_000,
        },
        local: {
            url: 'http://0.0.0.0:10002',
            account: config.localhostDeployerPrivateKey,
            gasPrice: 0x0,
            gasMultipiler: 0,
            gas: 30 * 1000000,
        },
        mumbai: {
            chainId: 80001,
            url: config.mumbaiUrl,
            accounts: [config.mumbaiDeployerPrivateKey],
            gasPrice: 50_000_000_000,
            gas: 30_000_000,
        }
    },
};
