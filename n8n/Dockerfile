FROM node:22-bookworm-slim AS builder

WORKDIR /home/node/app

COPY package.json package-lock.json tsconfig.json tsconfig.build.json .env ./

COPY src/ ./src/

RUN npm ci &&\
    npm run build &&\
    npm ci --omit=dev


FROM node:22-bookworm-slim

WORKDIR /home/node/app

RUN mkdir -p /sp/inputs /sp/output /sp/run /sp/secrets

ENV INPUT_DATA_FOLDER=/sp/inputs
ENV OUTPUT_DATA_FOLDER=/sp/output

COPY --from=builder --chown=node:node /home/node/app/dist ./dist
COPY --from=builder --chown=node:node /home/node/app/node_modules ./node_modules
COPY --from=builder --chown=node:node /home/node/app/package.json ./package.json
COPY --from=builder --chown=node:node /home/node/app/.env ./.env

USER node

ENTRYPOINT ["node", "./dist/index.js"]
