# X509 On-Chain Verifier

This project presents a simplified solution for the verification of x509 certificates. The example provided demonstrates on-chain:

- Verification of a signature created on the secp256r1 curve;
- Logic for checking a certificate chain with a signature on the secp256r1 curve;
- Logic for SGX Quote verification;

Planned enhancements:

- Verification of the certificate's validity period;
- Root certificate renewal upon expiration;
- List of revoked certificates and the mechanism for its update;
- List of compromised firmware and mechanisms for its update;
- Firmware version checks;
- Separation of certificate management logic and SGX Quote logic;

## Dependencies

- NodeJS v16.8.0
- NPM v7.21.0

## Setting Up Environments

create `.env` file out of example

```bash
cp .env.example .env
```

`PRIVATE_KEY` - the default private key for deployment and task execution.
`AMOY_URL` (optional) - the RPC node address for the Polygon Amoy network.
`OKLINK_AMOY_API` (optional) - the API key from your account in the oklink block explorer.

## Installation

```bash
npm ci
npx hardhat compile
```

## Deployment

`x509 verifier` requires an Intel SGX root CA certificate for deployment. It can be fount at the root of the project `intel-root-cert.pem`

```bash
npx hardhat deploy --cert ./intel-root-cert.pem --network <target-network>
```

## Testing

`npx hardhat test`

## Contract Verification

1. Set up new API key in `.env` and parse it in `config.js`
2. Set up this key in the field `etherscan.apiKey.YOUR_TARGET_NETWORK` in the file `hardhat.config.ts`
3. Run command:

```bash
npx hardhat verify-x509 --cert ./intel-root-cert.pem --address <deployed-contract-address> --network <target-network>
```

## License

This library is released under MIT.
