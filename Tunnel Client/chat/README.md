# Dependencies
* node (16+)

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
STORJ_TOKEN=1Hy2sAfK39Wm71Jjbtvy54tZCVTqa1H1Ny9k6KHzrwPcSrhak34ghpMmpuA9ZiJSF5Lfdx5Dikw1QEuWvtB3kbf84DyUk3txaur1hDML8jabDujZ9hEUi5zH341JU3AkfdTjQDaqRzYHxiVpRsr4CTwSyTzy5QkEoBT6otckVbjYSSonMVUuYQKvf9su8pGWDRBwPDw1doQ2fA23MBg87iNxKhhqWUDNJyUwX5A3vs2JP9Aw8rMXVUu8StXUAngX175wkK7yEz4pPiXP1beeftiZt3x36cXZfrz3mLX4WDT55Hq68uDW2KDA8vD8UHoomfWgbtrHdwM
STORJ_BUCKET=demo-bucket
NEXT_PUBLIC_REDIRECT_TIME=300000
```

For S3 Gateway

```
HTTPS_PORT=3000
CLIENT=S3
S3_ACCESS_KEY_ID=ju2...liq
S3_ACCESS_SECRET_KEY=j3ogx...nylrk
S3_ENDPOINT=https://gateway.storjshare.io
STORJ_BUCKET=demo-bucket
NEXT_PUBLIC_REDIRECT_TIME=300000
```


# Testing
* execute: `k6 run -e CONNECT_PASSWORD=8e14c9bf641ceeaff566a0f2dd09bb5be2d4315a4bfd8473363537e192cdedd8 -e HOSTNAME=chat.dev.superprotocol.com stress-tests.js`