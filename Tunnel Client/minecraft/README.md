# Super Protocol — Minecraft

## Description
This is the Minecraft server and client that can be run on SuperProtocol.

Key features:
- Server and client in one assembly
- Server — [flying-squid](https://github.com/PrismarineJS/flying-squid)
- Client — [prismarine-web-client](https://github.com/PrismarineJS/prismarine-web-client)

The client includes a web-server that connects to the MS Server and provides the UI to the user in a web browser.

## Local run
Prerequisites:
- Node.js (>18)
- Yarn (v.1)


To build and run in dev mode, rename the *.env.example* file to *.env* and fill in the appropriate parameters.

Next, run the commands:
```shell
cd minecraft
yarn dependencies
yarn build:all
yarn dev
```

## docker-compose
Generate self-signed key and ssl-certificate for localhost:
```shell
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.crt -sha256 -days 365 -nodes -subj "/CN=localhost"
```
Then create `docker-compose.yml` file with data:
```yml
version: "3.8"

services:
  sp-minecraft:
    image: node:18-buster
    container_name: sp-minecraft
    environment:
      HTTPS_PORT: 8888
      TLS_CERT: {data from cert.crt file}
      TLS_KEY: {data from key.pem file}
    volumes:
      - ./:/sp/run
    entrypoint: yarn build && yarn dev
    ports:
      - "8888:8888"
```

and run:
```shell
docker-compose up
```

## Run on SuperProtocol

to be continued...
<!--
Информация о запуске на Супере. 
Подготовка токена для тунель-сервера, сборка солюшена для туннель-клиента и команды запуска.
Нужно указать, как подготовить и с какими аргументами создавать workflow.
Нужно описать этапы сборки проекта для граминизации через spctl.
-->





