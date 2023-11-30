export type ChunkedX509Cert = {
  bodyPartOne: string;
  publicKey: string;
  bodyPartTwo: string;
  signature: string;
};

export const ChunkedX509CertAbi = {
  ChunkedX509Cert: {
    bodyPartOne: 'bytes',
    publicKey: 'bytes',
    bodyPartTwo: 'bytes',
    signature: 'bytes',
  },
};
