# Confidential oracle service

This service runs in an enclave, polls the API at a specified interval, and publishes the data to the oracle smart contract. This service is responsible for verifying that the root certificate from the API source matches the signature in the response, and for generating a TEE Quote to initiate a confidential session with the oracle smart contract.

## Dependencies

- NodeJS v16.8.0
- NPM v7.21.0

## Setting Up Configuration
create `.input.json` file out of example

```
cp ./inputs/input.example.json ./inputs/input.json
```

## Installation
```bash
npm ci
npm run build
```

## Deployment
This script is designed to run in a TEE enclave
```bash
npm run start
```
