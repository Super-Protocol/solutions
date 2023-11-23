import {
  Html, Head, Main, NextScript,
} from 'next/document';
import { BG_DARK } from '../common/constants';

export default function Document() {
  return (
    <Html lang="en" style={{ background: BG_DARK }}>
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
