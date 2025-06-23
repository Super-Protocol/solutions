#!/bin/bash

echo "Building Docker image..."
docker build -t sp-dia-tts-server .

echo "Creating test certificates..."
openssl req -x509 -newkey rsa:2048 -keyout test-key.pem -out test-cert.pem -days 1 -nodes -subj "/CN=localhost"

echo "Starting container..."
docker run -d \
  --name dia-tts-test \
  -p 8443:8443 \
  -e HTTPS_PORT=8443 \
  -e TLS_KEY="$(cat test-key.pem)" \
  -e TLS_CERT="$(cat test-cert.pem)" \
  -e LOG_LEVEL=info \
  sp-dia-tts-server

echo "Waiting for container to start..."
sleep 10

echo "Checking container logs:"
docker logs dia-tts-test

echo "Testing HTTPS endpoint..."
curl -k https://localhost:8443/health || echo "Health check failed (expected for incomplete setup)"

echo "Cleanup:"
docker stop dia-tts-test
docker rm dia-tts-test
rm test-key.pem test-cert.pem

echo "Test complete!"
