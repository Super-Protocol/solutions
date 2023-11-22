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
- Node.js (>16)
- Yarn (v.1)


To build and run in dev mode, copy the *.env.example* file to *.env*.
```shell
$ cp .env.example .env
```

Since the web client will connect to the web server over a secure https channel, we need to generate a private key and certificate.
You can do this with the following command:

```shell
$ openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.crt -sha256 -days 365 -nodes -subj "/CN=localhost"
```

As a result, you will have two files, ```cert.crt``` and ```key.pem``` in the directory from which you ran this command.

In order to put the key and certificate in our .env file, we need to convert the contents of these files to a single line. You can do this with the following command:
```shell
$ awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' cert.crt
# -----BEGIN CERTIFICATE-----\nMIIFCTCCAvGgAwIBA...
```
```shell
$ awk 'NF {sub(/\r/, ""); printf "%s\\n",$0;}' key.pem
# -----BEGIN PRIVATE KEY-----\nMIIJQwIBADANBgkqh...
```

The result of the output of these commands should be copied to the ```.env``` file:
```text
HTTPS_PORT=8888
TLS_CERT="-----BEGIN CERTIFICATE-----\nMIIFCTCCAvGgAwIBA..."
TLS_KEY="-----BEGIN PRIVATE KEY-----\nMIIJQwIBADANBgkqh..."
```

> Note that the values for TLS_CERT and TLS_KEY must be specified in quotes.

After that you can delete the ```cert.crt``` and ```key.pem``` files.

To install all dependencies, run the command:
```shell
$ yarn dependencies
$ yarn build:all
```

To run the solution in dev mode, run the command:

```shell
$ yarn dev
```

To run the solution in production mode, run the command:

```shell
$ yarn start
```

Or you can use docker-compose, for running the solution in a container:

```yml
version: '3.8'

services:
  sp-minecraft:
    image: node:16-buster
    container_name: sp-minecraft
    platform: linux/amd64
    env_file:
      - .env
    volumes:
      - ./:/sp/run
    entrypoint: ["/bin/sh","-c"]
    command:
      - |
        yarn --cwd /sp/run build:all 
        yarn --cwd /sp/run start
    ports:
      - "8888:8888"
```

```shell
$ docker-compose up
```

> Note that the ```platform: linux/amd64``` line is needed to run the solution on M1/M2 CPUs

## Run on SuperProtocol

to be continued...
