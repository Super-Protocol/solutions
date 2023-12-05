import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '/.env') });

export const config = {
    mumbaiUrl: process.env.MUMBAI_URL,
    mumbaiDeployerPrivateKey: process.env.MUMBAI_DEPLOYER_PRIVATE_KEY,
    localhostDeployerPrivateKey: process.env.LOCALHOST_DEPLOYER_PRIVATE_KEY,
    ethereumApiKey: process.env.ETHEREUM_API_KEY ?? '',
    polygonApiKey: process.env.POLYGON_API_KEY ?? '',
};
