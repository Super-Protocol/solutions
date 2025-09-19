FROM node:20-bookworm AS builder

WORKDIR /home/node/app

RUN apt-get update && apt-get install -y \
    build-essential \
    python3-dev \
    git \
    golang-go \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY . /home/node/app

RUN npm ci &&\
    npm run build &&\
    npm ci --omit=dev

FROM vllm/vllm-openai:v0.10.2

RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /home/node/app

RUN mkdir -p /sp/inputs /sp/output /sp/run

COPY --from=builder /home/node/app/dist ./dist
COPY --from=builder /home/node/app/node_modules ./node_modules
COPY --from=builder /home/node/app/package.json ./package.json
COPY --from=builder /home/node/app/.env ./.env

ENV PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True

ENTRYPOINT ["node", "./dist/index.js"]
