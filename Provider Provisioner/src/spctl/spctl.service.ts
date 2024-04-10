import fs from 'fs/promises';
import path from 'path';
import { ILogger } from '../logger';
import { spawnCommand } from './spawn-command';
import { CompleteOrdersParams, GetOrdersParams, Order, SpctlServiceParams } from './types';

export class SpctlService {
  protected readonly logger: ILogger;
  protected readonly locationPath: string;
  protected readonly configPath: string;

  constructor(params: SpctlServiceParams) {
    this.logger = params.logger;
    this.locationPath = params.locationPath;
    this.configPath = params.configPath;
  }

  getLocationPath(): string {
    return this.locationPath;
  }

  async getOrders(params: GetOrdersParams): Promise<Order[]> {
    const saveFileName = `get-orders-${new Date().getTime()}.json`;
    const args = [
      'orders',
      'list',
      '--config',
      this.configPath,
      '--limit',
      String(params.limit),
      '--offers',
      params.offerId,
      '--status',
      params.status,
      '--fields',
      'id',
      '--save-to',
      saveFileName,
    ];
    const saveFilePath = path.join(this.locationPath, saveFileName);

    await this.exec(args);

    const savedResult = JSON.parse(await fs.readFile(saveFilePath, 'utf-8'));

    await fs.rm(saveFilePath, { force: true });

    return savedResult.list;
  }

  async completeOrders(params: CompleteOrdersParams): Promise<string> {
    const args = [
      'orders',
      'complete',
      '--config',
      this.configPath,
      '--status',
      params.status,
      '--result',
      params.resultPath,
      ...params.orderIds,
    ];

    return await this.exec(args);
  }

  async getVersion(): Promise<string> {
    const args = ['-V'];

    return await this.exec(args);
  }

  private async exec(args: string[]): Promise<string> {
    const command = './spctl';
    const response = await spawnCommand(command, args, this.locationPath, this.logger);

    if (response.code > 0) {
      throw Error(response.stderr.toString());
    }

    return response.stdout.toString().trim();
  }
}
