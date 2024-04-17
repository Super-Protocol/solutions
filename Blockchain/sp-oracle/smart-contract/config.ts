import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '/.env') });

export const config = {
    amoyUrl: process.env.AMOY_URL,
    amoyDeployerPrivateKey: process.env.AMOY_DEPLOYER_PRIVATE_KEY,
    localhostDeployerPrivateKey: process.env.LOCALHOST_DEPLOYER_PRIVATE_KEY,
    ethereumApiKey: process.env.ETHEREUM_API_KEY ?? '',
    polygonApiKey: process.env.OKLINK_AMOY_API ?? '',
};
