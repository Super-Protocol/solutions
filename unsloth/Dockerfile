# Node.js build stage
FROM node:22-bookworm AS builder
WORKDIR /app
COPY package*.json tsconfig*.json ./
RUN npm ci
COPY src ./src
COPY .env .env
RUN npm run build && npm ci --omit=dev

# Python base with Node.js runtime
FROM unsloth/unsloth@sha256:0090e9aecad331e71ca4455a1582e9be0805f373f01788d20c0aef4b852149ff AS base

USER root

### Installing Node.js
# Download and install nvm:
ENV NODE_VERSION=22.21.1
ENV NVM_DIR=/usr/local/nvm
RUN mkdir -p $NVM_DIR
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
RUN . $NVM_DIR/nvm.sh \
  && nvm install $NODE_VERSION \
  && nvm alias default $NODE_VERSION \
  && nvm use default \
  && type node
ENV NODE_PATH=$NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH=$NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
RUN  node -v \
  && npm -v \
  && npm config get cache

# # Ensure sudo and ssh-keygen (openssh-client) are present for runtime needs
# RUN apt-get update \
#   && apt-get install -y --no-install-recommends \
#     sudo \
#     openssh-client \
#   && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /sp/inputs /sp/output /sp/run

WORKDIR /app

# Copy Node.js build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env ./.env

ENTRYPOINT ["node", "dist/index.js"]
