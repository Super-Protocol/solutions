FROM node:20-bookworm AS builder

WORKDIR /home/node/app

COPY . /home/node/app

RUN npm ci &&\
    npm run build &&\
    npm ci --omit=dev

FROM node:20-bookworm

ARG GPU_CHOICE

WORKDIR /home/node/app

RUN mkdir -p /sp/inputs /sp/output /sp/run

COPY --from=builder /home/node/app/text-generation-webui ./text-generation-webui

ENV GPU_CHOICE=$GPU_CHOICE

RUN apt update && apt install -y git &&\
    git config --global --add safe.directory /home/node/app/text-generation-webui &&\
    chmod +x ./text-generation-webui/start_linux.sh &&\
    find ./text-generation-webui -maxdepth 1 -type f -name "requirements*" -exec sed -i 's/transformers==/transformers[torch,flax,timm,sentencepiece,onnx,ftfy,tokenizers]==/g' {} \; &&\
    find ./text-generation-webui -maxdepth 1 -type f -name "requirements*" -exec sh -c 'echo "\nsacremoses\noptimum\nauto-gptq\nautoawq\nbitsandbytes" >> {}' \; &&\
    USE_CUDA118=FALSE LAUNCH_AFTER_INSTALL=FALSE INSTALL_EXTENSIONS=FALSE ./text-generation-webui/start_linux.sh &&\
    apt remove git -y &&\
    wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.0g-2ubuntu4_amd64.deb &&\
    dpkg -i libssl1.1_1.1.0g-2ubuntu4_amd64.deb &&\
    rm libssl1.1_1.1.0g-2ubuntu4_amd64.deb

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package.json ./package.json
COPY --from=builder /home/node/app/.env ./.env

ENTRYPOINT ["node", "./dist/index.js"]
