import { promises } from 'fs';

import { ITeeDeviceService } from '@super-protocol/tee-lib';
import { IQuoteProvider } from '../../common/intrefaces';

class QuoteProvider implements IQuoteProvider {
  private initialiazed: boolean;
  private teeDeviceService!: ITeeDeviceService;

  constructor() {
    this.initialiazed = false;
  }

  private async validateMode(): Promise<void> {
    try {
      await promises.access('/dev/attestation/report');
    } catch (error) {
      throw Error(`invalid running mode, is it run in gramine / gramine? ${error}`);
    }
  }

  public async initialize(): Promise<void> {
    await this.validateMode();
    const { TeeDeviceService } = await import('@super-protocol/tee-lib');

    this.teeDeviceService = new TeeDeviceService({});
    this.initialiazed = true;
  }

  public genQuote(userData: Buffer): Promise<Buffer> {
    if (!this.initialiazed) throw Error(`Quote provider hasn't been initialized`);

    return this.teeDeviceService.getDataOf(userData);
  }
}

export default QuoteProvider;
