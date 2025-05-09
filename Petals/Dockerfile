FROM node:20-bookworm as builder

WORKDIR /home/node/app

COPY . /home/node/app

RUN npm ci &&\
    npm run build &&\
    npm ci --omit=dev

FROM node:20-bookworm

WORKDIR /home/node/app

ENV LOG_LEVEL trace
ENV INPUT_DATA_FOLDER /sp/inputs

RUN mkdir -p /sp/inputs /sp/output /sp/run

COPY --from=builder /home/node/app/petals ./petals

RUN apt update && apt install -y git &&\
    git config --global --add safe.directory /home/node/app/petals &&\
    chmod +x ./petals/start_linux.sh &&\
    GPU_CHOICE=A USE_CUDA118=FALSE LAUNCH_AFTER_INSTALL=FALSE INSTALL_EXTENSIONS=FALSE ./petals/start_linux.sh &&\
    apt remove git -y &&\
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.0g-2ubuntu4_amd64.deb &&\
    dpkg -i libssl1.1_1.1.0g-2ubuntu4_amd64.deb &&\
    rm libssl1.1_1.1.0g-2ubuntu4_amd64.deb

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package.json ./package.json

ENTRYPOINT ["node", "./dist/index.js"]