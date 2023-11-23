import { QueryClientProvider } from 'react-query';
import type { AppProps } from 'next/app';
import NextNProgress from 'nextjs-progressbar';

import { queryClient } from '@/connectors/api';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppWrap } from '@/components/AppWrap';
import { PageHead } from '@/components/PageHead';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { MobileProvider } from '@/contexts/MobileContext';
import { Fonts } from '@/components/Fonts/Fonts';
import '../client/styles/index.scss';

const progressOptions = { showSpinner: false };

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <Fonts />
      <PageHead />
      <NextNProgress options={progressOptions} />
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MobileProvider>
            <AppWrap>
              <Component {...pageProps} />
            </AppWrap>
          </MobileProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
