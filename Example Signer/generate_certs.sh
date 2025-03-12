#!/bin/bash

CERTS_DIR=${CERTS_DIR:-"./certs"}

# Create directory for certificates
mkdir -p "$CERTS_DIR"

# Generate root CA certificate
openssl req -x509 -new -nodes -newkey rsa:4096 \
    -keyout "${CERTS_DIR}/order_cert.key" \
    -out "${CERTS_DIR}/order_cert.crt" \
    -days 365 \
    -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"

# Create CA bundle
cat "${CERTS_DIR}/order_cert.crt" > "${CERTS_DIR}/order_cert_ca_bundle.crt"

# Set correct permissions
chmod 644 "${CERTS_DIR}"/*
