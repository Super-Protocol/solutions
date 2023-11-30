# Oracle Smart Contracts

Contains the oracle smart contract, divided into two logical parts: Oracle.sol and Publisher.sol  
It also includes an example of a DApp with business logic - App.sol  

## Dependencies

- NodeJS v16.8.0
- NPM v7.21.0

## Setting Up Environments
create `.env` file out of example

```
cp .env.example .env
```

`MUMBAI_DEPLOYER_PRIVATE_KEY` - the default private key for deployment and task execution.  
`MUMBAI_URL` - the RPC node address for the Polygon Mumbai network.  
`POLYGON_API_KEY` (optional) - the API key from your account in the PolygonScan block explorer.  
`ETHEREUM_API_KEY` (optional) - the API key from your account in the Etherscan block explorer.  

## Installation
```bash
npm ci
npx hardhat compile
```

## Deployment
Main oracle smart-contracts:
```
npx hardhat deploy-oracle --publishers <publishers_addresses> --enclave <your_script_hash> --signer <your_script_signer> --network <netwok_name>
```
`<publishers_addresses>` - Wallet addresses that will send transactions from scripts. Specify with commas  
`<your_script_hash>` and `<your_script_signer>` - mrEnclave and mrSigner from the script. You can get these values using [CTL](https://github.com/Super-Protocol/ctl)  

Example "DApp" that uses the oracle:  
```
npx hardhat deploy-app --oracle <oracle_address> --network <netwok_name>
```
