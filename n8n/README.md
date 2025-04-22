# n8n on SuperProtocol

This repository contains the SuperProtocol integration for [n8n](https://n8n.io/), a workflow automation platform that allows you to connect different services and automate workflows without coding.

## Overview

This solution allows you to run n8n workflows in SuperProtocol's Trusted Execution Environment (TEE), providing enhanced security and privacy for your automation workflows. 

## Prerequisites

- SuperProtocol CLI tool (`spctl`) next to script file
- Configuration file with proper workflow encryption keys (`config.json`)

## Quick Start

### Running n8n with an Automatic Domain

Use the `run-n8n-with-domain.sh` script to start an n8n instance with an automatically provisioned domain:

```bash
./scripts/run-n8n-with-domain.sh --input dev --tee <TEE_NUMBER>
```

### Script Parameters

- `--input <env>`: Environment to use (required)
  - Options: `dev`, `stg`, `mainnet`
- `--tee <number>`: TEE offer number for n8n launch (required)
- `--config <file>`: Path to configuration file (default: `./config.json`)
- `--solution <number or resource.json>`: N8N solution number or resource (required for non-dev environments)

### Examples

Running in the dev environment with default configuration:
```bash
./scripts/run-n8n-with-domain.sh --input dev --tee 42
```

Running in staging with a custom configuration file and solution number:
```bash
./scripts/run-n8n-with-domain.sh --input stg --tee 2 --config ./my-config.json --solution n8n-resource.json
```

### Extracting Domain Without Waiting

If you've already launched an n8n instance with a tunnels launcher and don't want to wait for the main script to complete, you can use the `extract-domain.sh` script to check and extract the domain:

```bash
./scripts/extract-domain.sh --order-id <launcher_order_id> [--config <file>]
```

Parameters:
- `--order-id`: The tunnel launcher order ID to check (required)
- `--config`: Path to configuration file (default: `./config.json`)

The script will check the order result periodically (every 30 seconds) until the domain information is available and then display the URL where your n8n instance can be accessed.

## How It Works

The script performs the following steps:
1. Validates input parameters
2. Extracts encryption keys from the configuration file
3. Creates a tunnels launcher in SuperProtocol's TEE
4. Creates an n8n configuration with the tunnel details
5. Launches the n8n workflow in the specified TEE
6. Retrieves and displays the domain where your n8n instance is accessible

Once started, your n8n instance will be available at the provided HTTPS URL.
