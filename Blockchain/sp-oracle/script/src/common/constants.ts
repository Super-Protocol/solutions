export const HTTPS_NODE_URL =
  process.env.NODE_ENV === 'test'
    ? 'http://blockchain:8545'
    : 'https://mumbai.polygon.superprotocol.com/hesoyam';
export const GAS_LIMIT = 10_000_000;
export const ORACLE_ABI = [
  {
    inputs: [
      {
        internalType: 'address[]',
        name: '_publishers',
        type: 'address[]',
      },
      {
        internalType: 'address',
        name: '_X509Verifier',
        type: 'address',
      },
      {
        internalType: 'bytes32',
        name: '_appHash',
        type: 'bytes32',
      },
      {
        internalType: 'bytes32',
        name: '_mrSigner',
        type: 'bytes32',
      },
    ],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [],
    name: 'AccessForbidden',
    type: 'error',
  },
  {
    inputs: [],
    name: 'CallbackFailed',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidQuote',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSessionKey',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSignatureSize',
    type: 'error',
  },
  {
    inputs: [],
    name: 'PublicKeyIsNotInitialized',
    type: 'error',
  },
  {
    inputs: [],
    name: 'SignatureIsNotUnique',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: 'key',
        type: 'bytes32',
      },
      {
        internalType: 'bytes',
        name: 'value',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'signature',
        type: 'bytes',
      },
      {
        internalType: 'bytes',
        name: 'callback',
        type: 'bytes',
      },
    ],
    name: 'add',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'bytes32',
        name: '',
        type: 'bytes32',
      },
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    name: 'data',
    outputs: [
      {
        internalType: 'uint32',
        name: 'timestamp',
        type: 'uint32',
      },
      {
        internalType: 'bytes',
        name: 'value',
        type: 'bytes',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        components: [
          {
            internalType: 'bytes',
            name: 'bodyPartOne',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'publicKey',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'bodyPartTwo',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct ChunkedX509Cert',
        name: 'deviceCert',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'bodyPartOne',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'publicKey',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'bodyPartTwo',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'signature',
            type: 'bytes',
          },
        ],
        internalType: 'struct ChunkedX509Cert',
        name: 'intermCert',
        type: 'tuple',
      },
      {
        components: [
          {
            internalType: 'bytes',
            name: 'header',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'isvReport',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'isvReportSignature',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'attestationKey',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'qeReport',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'qeReportSignature',
            type: 'bytes',
          },
          {
            internalType: 'bytes',
            name: 'qeAuthenticationData',
            type: 'bytes',
          },
        ],
        internalType: 'struct ChunkedSGXQuote',
        name: 'parsedQuoteData',
        type: 'tuple',
      },
      {
        internalType: 'address',
        name: 'sessionPublicKeyHash',
        type: 'address',
      },
    ],
    name: 'initSessionKey',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;
