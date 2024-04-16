# Provider Provisioner

An application that enables the handling of orders.

If you are a provider you can delegate the handling of orders based on your data and solution offers to this solution.

## Setup
1. **Install node_modules**:
```bash
npm ci
```
2. **Create .env file**:
```bash
cp .env.example .env
```
In the `.env` file, set the following variables:
```bash
LOG_LEVEL=trace
INPUT_DATA_FOLDER=./sp-inputs
```
3. **Add input folders**: in the `./sp-inputs` directory, add folders named `input-00x`. In each folder, add `config.json` and `.env` files. The structure should look like this:
```
sp-inputs
├── input-0001
│   ├── .env
│   └── config.json
└── input-0002
    ├── .env
    └── config.json
```
The `.env` file should contain only one environment variable `PROVIDER_OFFERS_JSON`. Its value should be a JSON array where each item corresponds to the following interface:
```typescript
interface ProviderOffersJsonItem {
  id: string;
  encryption: Encryption;
  resource: Resource;
}
```
The `config.json` file is spctl config.

## Running the Service

To run the service in dev mode, execute the following command:
```bash
npm run start:dev
```

That’s it! You’re all set to start developing and testing this project.
