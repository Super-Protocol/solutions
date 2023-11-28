import { promises } from 'fs';

import { IQuoteProvider } from "../common/intrefaces";

class QuoteProvider implements IQuoteProvider {
    private initialiazed: boolean;
    private debugMode: boolean;

    constructor(debugMode: boolean) {
        this.debugMode = debugMode;
        this.initialiazed = false;
    }

    private async validateMode() {
        if (this.debugMode) return;
    
        try {
            await promises.access('/dev/attestation/report');
        } catch (error) {
          throw Error(
            `invalid running mode, is it run in gramine / gramine? ${error}`,
          );
        }
    }

    public async initialiaze() {
        await this.validateMode();
        this.initialiazed = true;
    }

    public async genQuote(userData: Buffer): Promise<Buffer> {
        if (!this.initialiazed) throw Error(`Quote provider hasn't been initialized`)

        if (!this.debugMode) {
            await promises.writeFile(
                '/dev/attestation/user_report_data',
                Buffer.concat([userData, Buffer.alloc(64)]).slice(0, 64), // align
            );
        
            return await promises.readFile('/dev/attestation/quote');
        } else {
            return Buffer.alloc(0);
        }
    }
}

export default QuoteProvider;
