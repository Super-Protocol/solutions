export type ChunkedSGXQuote = {
  header: Uint8Array;
  isvReport: Uint8Array;
  isvReportSignature: Uint8Array;
  attestationKey: Uint8Array;
  qeReport: Uint8Array;
  qeReportSignature: Uint8Array;
  qeAuthenticationData: Uint8Array;
};

export const ChunkedSGXQuoteAbi = {
  ChunkedSGXQuote: {
    header: 'bytes',
    isvReport: 'bytes',
    isvReportSignature: 'bytes',
    attestationKey: 'bytes',
    qeReport: 'bytes',
    qeReportSignature: 'bytes',
    qeAuthenticationData: 'bytes',
  },
};
