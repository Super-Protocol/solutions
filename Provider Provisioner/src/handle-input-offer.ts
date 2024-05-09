import fs from 'fs/promises';
import { ILogger } from './logger';
import { SpctlService } from './spctl/spctl.service';
import { OrderStatus } from './spctl/types';
import { InputOffer } from './types';
import { StorageResourceValidationError } from 'spctl/build/services/completeOrder';

interface HandleInputOfferParams {
  inputOffer: InputOffer;
  spctlService: SpctlService;
  logger: ILogger;
}

interface CompleteOrderWithErrorParams {
  orderId: string;
  errorMessage: string;
  spctlService: SpctlService;
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
  await spctlService.initialize();

  const resourceJsonPath = 'resource.json';
  await fs.writeFile(resourceJsonPath, JSON.stringify(inputOffer.resourceFileContent), 'utf-8');

  await Promise.allSettled(
    orders.map(async (order) => {
      try {
        await spctlService.completeOrder({
          orderId: order.id,
          status: OrderStatus.Done,
          resultPath: resourceJsonPath,
        });
      } catch (err) {
        if (err instanceof StorageResourceValidationError) {
          log.error({ err }, `Completing order ${order.id} with status Error`);
          return await completeWithError({
            orderId: order.id,
            errorMessage: err.message,
            spctlService,
          }).catch((err) => log.error({ err }, 'Completing order with Error failed. Ignoring...'));
        }

        log.error({ err }, `Failed to complete order ${order.id} with status Done`);
      }
    }),
  );

  await fs.rm(resourceJsonPath, { force: true });
}

async function completeWithError(params: CompleteOrderWithErrorParams) {
  const { orderId, errorMessage, spctlService } = params;
  const errorPath = `tmp-order-${orderId}-result.txt`;
  try {
    await fs.writeFile(errorPath, JSON.stringify(errorMessage), 'utf-8');

    await spctlService.completeOrder({
      orderId,
      status: OrderStatus.Error,
      resultPath: errorPath,
    });
  } finally {
    await fs.rm(errorPath, { force: true });
  }
}
