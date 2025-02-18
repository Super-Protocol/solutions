# Example Signer

A comprehensive solution for signing and verifying data within confidential environments using order report chain.

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

1. **Generate Test Certificate**
   ```bash
   ./generate_certs.sh
   ```

2. **Create Output Directory and Generate Signature**
   ```bash
   mkdir ./output
   ./sign_data.sh crypto
   ```

3. **Verify Signature**
   ```bash
   ./verify_signature.sh
   ```

## Server Deployment Guide

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [SPCTL](https://docs.superprotocol.com/cli/)
- Valid configuration file (`config.example.json`)

### Deployment Steps

1. **Build Docker Image**
   ```bash
   docker build -t example_signer:latest .
   ```

2. **Export Docker Image**
   ```bash
   docker save example_signer:latest | gzip > example_signer:latest.tar.gz
   ```

3. **Upload to Decentralized Storage**
   ```bash
   ./spctl files upload example_signer:latest.tar.gz \
     --output example_signer.json \
     --filename example_signer.tar.gz \
     --config ./config.example.json
   ```

4. **Create Order**
   ```bash
   ./spctl workflows create \
     --tee 7,13 \
     --tee-slot-count 1 \
     --solution ./example_signer.json \
     --storage 49 \
     --config ./config.example.json
   ```

5. **Monitor Order Status**
   ```bash
   ./spctl orders get <YOUR_ORDER_ID> --config ./config.example.json
   ```

6. **Download Results**
   ```bash
   ./spctl orders download-result <YOUR_ORDER_ID> --config ./config.example.json
   ```

7. **Extract Results**
   ```bash
   tar -xvzf result.tar.gz
   ```

8. **Verify Signature**
   ```bash
   CERTS_DIR=./output ./verify_signature.sh
   ```

## Contributing

Feel free to submit issues and enhancement requests via the repository's issue tracker.

## License

This project is licensed under the terms specified in the repository's LICENSE file.
