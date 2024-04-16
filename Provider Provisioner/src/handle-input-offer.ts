import fs from 'fs/promises';
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

  const offerId = inputOffer.id;
  const log = logger.child({ offerId });

  log.debug('Getting order ids...');
  const orders = await spctlService.getOrders({
    offerId,
    limit: 1000,
    statuses: orderStatuses,
  });
  log.debug({ numOfOrders: orders.length }, 'Got orders');

  if (!orders.length) {
    return;
  }

  const resourceJsonPath = 'resource.json';
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
