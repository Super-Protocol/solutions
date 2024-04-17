import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'solidity-coverage';
import 'hardhat-gas-reporter';
import { config } from './config';
import { utils } from 'ethers';

import './tasks/deploy';
import './tasks/verify';

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
    solidity: {
        compilers: [
            {
                version: '0.8.19',
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    },
                },
            },
        ],
    },
    contractSizer: {
        alphaSort: false,
        disambiguatePaths: true,
        runOnCompile: true,
        strict: false,
    },
    mocha: {
        timeout: 0,
        bail: true,
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
        },
        local: {
            url: 'http://localhost:8545',
            account: config.localhostDeployerPrivateKey,
        },
        amoy: {
            chainId: 80002,
            url: config.amoyUrl,
            accounts: [config.amoyDeployerPrivateKey],
        },
    },
    etherscan: {
        apiKey: {
            mainnet: config.ethereumApiKey,
            polygon: config.polygonApiKey,
            polygonAmoy: config.polygonApiKey,
        },
        customChains: [
            {
                network: 'polygonAmoy',
                chainId: 80002,
                urls: {
                    apiURL:
                    'https://www.oklink.com/api/explorer/v1/contract/verify/async/api/polygonAmoy',
                    browserURL: 'https://www.oklink.com/polygonAmoy',
                },
            },
        ],
    }
};
