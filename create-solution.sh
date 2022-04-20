#!/bin/sh -ex

cd gsc

docker rmi registry.dev.superprotocol.com/$1 || echo "Image registry.dev.superprotocol.com/$1 doesn't exist"

docker rmi gsc-registry.dev.superprotocol.com/$1 || echo "Image gsc-registry.dev.superprotocol.com/$1 doesn't exist"

docker rmi gsc-registry.dev.superprotocol.com/$1-unsigned || echo "Image gsc-registry.dev.superprotocol.com/$1-unsigned doesn't exist"

docker build -t registry.dev.superprotocol.com/$1 -f ../base_images/$1/Dockerfile ../base_images/$1/

./gsc build registry.dev.superprotocol.com/$1 ../base_images/$1/image.manifest

./gsc sign-image registry.dev.superprotocol.com/$1 ../base_images/$1/enclave-key.pem

docker image save gsc-registry.dev.superprotocol.com/$1 -o ../solution.tar

echo "Solution was written at $PWD/solution.tar"

