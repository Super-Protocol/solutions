export const HTTPS_NODE_URL = 'https://mumbai.polygon.superprotocol.com/hesoyam';
export const GAS_LIMIT = 5_000_000;
export const ORACLE_ABI = [
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "_publishers",
          "type": "address[]"
        },
        {
          "internalType": "bytes32",
          "name": "_appHash",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [],
      "name": "AccessForbidden",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "NoDataAvailable",
      "type": "error"
    },
    {
      "inputs": [],
      "name": "OutOfIndex",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "key",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "value",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "quote",
          "type": "bytes"
        }
      ],
      "name": "add",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "data",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "timestamp",
          "type": "uint32"
        },
        {
          "internalType": "bytes",
          "name": "value",
          "type": "bytes"
        },
        {
          "internalType": "bytes",
          "name": "quote",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAppHash",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "key",
          "type": "bytes32"
        }
      ],
      "name": "getCurrent",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "bytes",
              "name": "value",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "quote",
              "type": "bytes"
            }
          ],
          "internalType": "struct OracleData",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "key",
          "type": "bytes32"
        }
      ],
      "name": "getCurrentRaw",
      "outputs": [
        {
          "internalType": "bytes",
          "name": "",
          "type": "bytes"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "key",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "from",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "to",
          "type": "uint256"
        }
      ],
      "name": "getHistory",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "bytes",
              "name": "value",
              "type": "bytes"
            },
            {
              "internalType": "bytes",
              "name": "quote",
              "type": "bytes"
            }
          ],
          "internalType": "struct OracleData[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
];