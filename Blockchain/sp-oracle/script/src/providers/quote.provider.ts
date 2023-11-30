import { promises } from 'fs';

import { TeeDeviceService, ZeroTeeDeviceService, ITeeDeviceService } from '@super-protocol/tee-lib';
import { IQuoteProvider } from '../common/intrefaces';

class QuoteProvider implements IQuoteProvider {
  private initialiazed: boolean;
  private debugMode: boolean;
  private teeDeviceService: ITeeDeviceService;

  constructor(debugMode: boolean) {
    this.debugMode = debugMode;
    this.initialiazed = false;
    this.teeDeviceService = debugMode ? new ZeroTeeDeviceService({}) : new TeeDeviceService({});
  }

  private async validateMode(): Promise<void> {
    if (this.debugMode) return;

    try {
      await promises.access('/dev/attestation/report');
    } catch (error) {
      throw Error(`invalid running mode, is it run in gramine / gramine? ${error}`);
    }
  }

  public async initialiaze(): Promise<void> {
    await this.validateMode();
    this.initialiazed = true;
  }

  public genQuote(userData: Buffer): Promise<Buffer> {
    if (!this.initialiazed) throw Error(`Quote provider hasn't been initialized`);

    return this.teeDeviceService.getDataOf(userData);
  }
}

export default QuoteProvider;
