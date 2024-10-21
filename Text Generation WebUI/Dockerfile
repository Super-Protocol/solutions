FROM node:20-bookworm AS builder

WORKDIR /home/node/app

COPY . /home/node/app

RUN npm ci &&\
    npm run build &&\
    npm ci --omit=dev

FROM node:20-bookworm

WORKDIR /home/node/app

ENV LOG_LEVEL=trace
ENV INPUT_DATA_FOLDER=/sp/inputs

ENV MRENCLAVE=3f8646fd08bfd64f2a1edfde832fe9c9a52526e02fd6d742adc99593b6e9342d
ENV MRSIGNER=292dbf9d7256b124de0259dca586c53135175f431f2336d4a27c49c3cd60b518
ENV BLOCKCHAIN_URL=https://amoy.polygon.superprotocol.com/over9000
ENV BLOCKCHAIN_CONTRACT_ADDRESS=0x6D5C1F3Ccda361c0EFCf028Bc99Ca2783Be766ce

RUN mkdir -p /sp/inputs /sp/output /sp/run

COPY --from=builder /home/node/app/text-generation-webui ./text-generation-webui

RUN apt update && apt install -y git &&\
    git config --global --add safe.directory /home/node/app/text-generation-webui &&\
    chmod +x ./text-generation-webui/start_linux.sh &&\
    GPU_CHOICE=A USE_CUDA118=FALSE LAUNCH_AFTER_INSTALL=FALSE INSTALL_EXTENSIONS=FALSE ./text-generation-webui/start_linux.sh &&\
    apt remove git -y &&\
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.0g-2ubuntu4_amd64.deb &&\
    dpkg -i libssl1.1_1.1.0g-2ubuntu4_amd64.deb &&\
    rm libssl1.1_1.1.0g-2ubuntu4_amd64.deb

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package.json ./package.json

ENTRYPOINT ["node", "./dist/index.js"]
