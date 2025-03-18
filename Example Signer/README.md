# Example Signer

A comprehensive solution for signing and verifying data within confidential environments using an order report chain.

## Overview

This repository provides tools and scripts for secure data signing operations in confidential environments. The implementation includes certificate generation, data signing, and signature verification capabilities.

## Repository Structure

| File | Description |
|------|-------------|
| `generate_certs.sh` | Script for generating self-signed certificates |
| `sign_data.sh` | Core script for confidential environment operations and local testing |
| `verify_signature.sh` | Tool for validating generated signatures |
| `Dockerfile` | Configuration for building the application container |

## Local Testing Guide

### Prerequisites

- Bash environment
- OpenSSL installed
- Docker (optional)

### Testing Steps

1. **Generate a test certificate**
   ```bash
   ./generate_certs.sh
   ```

2. **Create the output directory and generate a signature**
   ```bash
   mkdir ./output
   ./sign_data.sh crypto
   ```

3. **Verify the signature**
   ```bash
   ./verify_signature.sh
   ```

## Server Deployment Guide

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [SPCTL](https://docs.superprotocol.com/cli/)
- Valid SPCTL configuration file (`config.example.json`)

### Deployment Steps

1. **Build a Docker image**
   ```bash
   docker build -t example_signer:latest .
   ```

2. **Export the Docker image**
   ```bash
   docker save example_signer:latest | gzip > example_signer:latest.tar.gz
   ```

3. **Upload to decentralized storage**
   ```bash
   ./spctl files upload example_signer:latest.tar.gz \
     --output example_signer.json \
     --filename example_signer.tar.gz \
     --config ./config.example.json
   ```

4. **Create an order**
   ```bash
   ./spctl workflows create \
     --tee 7,13 \
     --tee-slot-count 1 \
     --solution ./example_signer.json \
     --storage 47 \
     --config ./config.example.json
   ```

5. **Monitor the order status**
   ```bash
   ./spctl orders get <YOUR_ORDER_ID> --config ./config.example.json
   ```

6. **Download the order result**
   ```bash
   ./spctl orders download-result <YOUR_ORDER_ID> --config ./config.example.json
   ```

7. **Extract the order results**
   ```bash
   tar -xvzf result.tar.gz
   ```

8. **Verify the signature**
   ```bash
   CERTS_DIR=./output ./verify_signature.sh
   ```

## Contributing

Feel free to submit issues and enhancement requests via the repository's issue tracker.

## License

This project is licensed under the terms specified in the repository's LICENSE file.
