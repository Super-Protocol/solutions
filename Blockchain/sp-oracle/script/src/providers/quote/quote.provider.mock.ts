import path from 'path';
import fs from 'fs';
import { IQuoteProvider } from '../../common/intrefaces';

class QuoteProviderMock implements IQuoteProvider {
  public initialize(): Promise<void> {
    return Promise.resolve();
  }

  async genQuote(): Promise<Buffer> {
    const quoteMockPath = path.join(__dirname, '../../../../shared/quoteMock.json');
    const quoteMock = fs.readFileSync(quoteMockPath).toString();

    return Buffer.from(JSON.parse(quoteMock).quote, 'base64');
  }
}

export default QuoteProviderMock;
