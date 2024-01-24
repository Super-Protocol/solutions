import { IQuoteProvider } from '../../common/intrefaces';
import QuoteProviderMock from './quote.provider.mock';
import QuoteProvider from './quote.provider';

const printDebugModeWarning = (): void => {
  console.warn('\n\n');
  for (let i = 0; i < 5; i++) {
    console.warn('WARNING!! DEBUG MODE!! ALL SECURITY MECHANISMS ARE DISABLED!!!');
  }
  console.warn('\n\n');
};

export const getQuoteProvider = (): IQuoteProvider => {
  const isMockQuote = process.env.NODE_ENV === 'test';

  if (isMockQuote) {
    printDebugModeWarning();

    const printDebugModeWarningInterval = 5 * 60 * 1000; //5 min
    setInterval(() => printDebugModeWarning(), printDebugModeWarningInterval);

    return new QuoteProviderMock();
  }

  return new QuoteProvider();
};
