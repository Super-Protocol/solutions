import fs from 'fs/promises';
import path from 'path';
import { ILogger } from './logger';
import { SpctlService } from './spctl/spctl.service';
import { OrderStatus } from './spctl/types';
import { InputOffer } from './types';

interface HandleInputOfferParams {
  inputOffer: InputOffer;
  spctlService: SpctlService;
  logger: ILogger;
}

export async function handleInputOffer(params: HandleInputOfferParams): Promise<void> {
  const { inputOffer, spctlService, logger } = params;
  const orderStatuses = [OrderStatus.New, OrderStatus.Processing];

  for (const orderStatus of orderStatuses) {
    const offerId = inputOffer.id;
    const log = logger.child({ offerId, orderStatus });

    log.debug('Getting order ids...');
    const orders = await spctlService.getOrders({
      offerId,
      limit: 1000,
      status: orderStatus,
    });

    if (!orders.length) {
      log.debug('No active orders found');
      continue;
    }

    log.debug({ numOfOrders: orders.length }, 'Got orders');

    const resourceJsonPath = path.join(spctlService.getLocationPath(), 'resource.json');
    await fs.writeFile(resourceJsonPath, JSON.stringify(inputOffer.resourceFileContent), 'utf-8');

    try {
      await spctlService.completeOrders({
        orderIds: orders.map((order) => order.id),
        status: OrderStatus.Done,
        resultPath: resourceJsonPath,
      });
    } catch (err) {
      log.error({ err }, 'Failed to complete orders');
    } finally {
      await fs.rm(resourceJsonPath, { force: true });
    }
  }
}
