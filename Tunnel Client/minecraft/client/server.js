#!/usr/bin/env node

const express = require("express");
const netApi = require("net-browserify");
const compression = require("compression");
const path = require("path");
const https = require("https");
const http = require("http");
const pino = require("pino");

const logger = pino().child({ class: "client" });

// Create our app
const app = express();

const credentials = { key: process.env.TLS_KEY, cert: process.env.TLS_CERT };

app.get("/config.json", (_, res) =>
  res.sendFile(path.join(__dirname, "config.json"))
);

app.use(compression());

if (process.argv[3] === "dev") {
  // https://webpack.js.org/guides/development/#using-webpack-dev-middleware
  const webpackDevMiddleware = require("webpack-dev-middleware", {
    https: true,
  });
  const config = require("./webpack.dev.js");
  const webpack = require("webpack");
  const compiler = webpack(config);

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: config.output.publicPath,
    })
  );
} else {
  app.use(express.static(path.join(__dirname, "./public")));
}

const httpsServer =
  credentials.key && credentials.cert
    ? https.createServer(credentials, app)
    : http.createServer(app);

app.use(netApi({ allowOrigin: "*", server: httpsServer }));

const port = process.env.HTTPS_PORT;

// Start the WebServer
httpsServer
  .listen(port, function () {
    logger.info({ port }, "Client WebServer started to listen");
  })
  .on("error", (err) => {
    logger.error({ err }, "Client WebServer failed to start");
  });
