# Superprotocol Secret Chat

This is NextJS application SuperProtocol Secret Chat.

Detailed project description you can find in our docs [here](https://docs.superprotocol.com/developers/offers/superchat/)

Up and run instructions you can find [here](https://docs.superprotocol.com/developers/deployment_guides/tunnels/superchat)

# Develop

* Touch .env file with [env](#env)
* Run `npm i`
* Run `npm run build`
* Run `npm run dev`
* Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Production

* Touch .env file with [env](#env)
* Run `npm i`
* Run `npm run build`
* Run `npm start`
* Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

# Docker
* Touch .env file with [env](#env)
* Create base64 from [env](#env) file
* Run `docker build --build-arg ENV_FILE=YOUR_BASE64_ENV --build-arg HTTPS_PORT=YOUR_PORT -t YOUR_TAG_NAME .`
* Run `docker run -p YOUR_PORT:YOUR_PORT -it YOUR_TAG_NAME`

# env

```bash
HTTPS_PORT=... - server port (default 3000)
STORJ_TOKEN=... - storj access token
STORJ_BUCKET=... - storj bucket name
STORJ_PREFIX=... - storj prefix (default empty string '')
NEXT_PUBLIC_REDIRECT_TIME=... - time to redirect if unable to connect (default 300000)
```

# env example

For StorJ Adapter

```
HTTPS_PORT=3000
CLIENT=STORJ
STORJ_TOKEN=1Hy2sA92........rHdwM
STORJ_BUCKET=demo-bucket
NEXT_PUBLIC_REDIRECT_TIME=300000
```

For S3 Gateway

```
HTTPS_PORT=3000
CLIENT=S3
S3_ACCESS_KEY_ID=ju2...liq
S3_ACCESS_SECRET_KEY=j3ogx......nylrk
S3_ENDPOINT=https://gateway.storjshare.io
STORJ_BUCKET=demo-bucket
NEXT_PUBLIC_REDIRECT_TIME=300000
```
