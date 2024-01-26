FROM node:16-bullseye

COPY ./sp-oracle/smart-contract /app
COPY ./sp-x509 /app/verifier
COPY ./sp-oracle/script/inputs /app/inputs

ENV INPUT_DIR=/app/inputs
ENV OUTPUT_PATH=/output

WORKDIR /app

CMD ["node", "dist/smart-contract/blockchainServer/index.js"]