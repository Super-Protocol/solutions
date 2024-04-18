import fs from 'fs/promises';
import { ILogger } from '../logger';
import ordersComplete from 'spctl/build/commands/ordersComplete';
import ordersList from 'spctl/build/commands/ordersList';
import ConfigLoader from 'spctl/build/config';
import { CompleteOrdersParams, GetOrdersParams, Order, SpctlServiceParams } from './types';

export class SpctlService {
  protected readonly logger: ILogger;
  protected readonly configPath: string;

  constructor(params: SpctlServiceParams) {
    this.logger = params.logger;
    this.configPath = params.configPath;
  }

  async getOrders(params: GetOrdersParams): Promise<Order[]> {
    const saveFilePath = `get-orders-${new Date().getTime()}.json`;

    const { config, error } = ConfigLoader.getRawConfig(this.configPath);

    if (!config || error) {
      this.logger.error({ err: error }, 'Cannot parse config');
      return [];
    }

    await ordersList({
      fields: ['id'],
      backendUrl: config.backend.url,
      accessToken: config.backend.accessToken,
      limit: params.limit,
      offerIds: [params.offerId],
      statuses: params.statuses,
      saveTo: saveFilePath,
    });

    const savedResult = JSON.parse(await fs.readFile(saveFilePath, 'utf-8'));

    await fs.rm(saveFilePath, { force: true });

    return savedResult.list;
  }

  async completeOrders(params: CompleteOrdersParams): Promise<void> {
    const { config, error } = ConfigLoader.getRawConfig(this.configPath);

    if (!config || error) {
      this.logger.error({ err: error }, 'Cannot parse config');
      return;
    }

    const blockchainConfig = {
      contractAddress: config.blockchain.smartContractAddress,
      blockchainUrl: config.blockchain.rpcUrl,
    };

    await ordersComplete({
      blockchainConfig,
      actionAccountKey: config.blockchain.accountPrivateKey,
      ids: params.orderIds,
      status: params.status,
      resourcePath: params.resultPath,
      pccsApiUrl: config.tii.pccsServiceApiUrl,
      accessToken: config.backend.accessToken,
      backendUrl: config.backend.url,
    });
  }
}
