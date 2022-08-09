#!/bin/sh -ex

GSC_FIXED_COMMIT="42199be577679703a4312edaec96cc9ea99eaec9"
IMAGE_TGZ_NAME="python3.8-base-solution-image-0.2.0.image.tar.gz"

docker rmi gsc-python3.8-base-solution -f
docker rmi gsc-python3.8-base-solution-unsigned -f
docker rmi python3.8-base-solution -f

docker build -t python3.8-base-solution .

rm -f enclave-key.pem
openssl genrsa -3 -out enclave-key.pem 3072

rm -rf ./gsc
git clone https://github.com/gramineproject/gsc && cd gsc && git reset --hard "${GSC_FIXED_COMMIT}"

./gsc build python3.8-base-solution ../python3.8-base.manifest -c ../gsc-config.yaml
./gsc sign-image python3.8-base-solution ../enclave-key.pem -c ../gsc-config.yaml
rm -f "../${IMAGE_TGZ_NAME}"
docker save gsc-python3.8-base-solution | gzip > "../${IMAGE_TGZ_NAME}"
