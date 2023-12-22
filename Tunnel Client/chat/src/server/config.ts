import { getConfig as getConfigClient } from '../client/utils/config';

export const getConfig = () => ({
  ...getConfigClient(),
  DOWNLOADER: {
    lruCache: {
      max: 500,
    },
    writeInterval: Number(process.env.WRITE_INTERVAL) || 4000, // 4 sec
    readInterval: Number(process.env.READ_INTERVAL) || 1000, // 1 sec
    objectDeletedFlag: 'deleted',
  },
  IPFS_URL: process.env.IPFS_URL,
  CLIENT: process.env.CLIENT,
  STORJ_CREDENTIALS: {
    prefix: process.env.STORJ_PREFIX || '',
    bucket: process.env.STORJ_BUCKET,
    token: process.env.STORJ_TOKEN,
  },
  S3_CREDENTIALS: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
    endpoint: process.env.S3_ENDPOINT || 'https://gateway.storjshare.io',
    bucket: process.env.STORJ_BUCKET,
    region: process.env.S3_REGION || 'us-east-1',
  },
  jwt: {
    expires: 14, // days
  },
});
