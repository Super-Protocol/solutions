import { resolve } from "path";
import * as wt from "worker_threads";
import dotenv from "dotenv";
import pino from "pino";

const logger = pino().child({ class: "server" });

const dev = process.argv[2] === "dev";

if (dev) {
  dotenv.config();
}

const env: any = {};

if (process.env.HTTPS_PORT) {
  env.HTTPS_PORT = process.env.HTTPS_PORT;
}

if (process.env.TLS_CERT) {
  env.TLS_CERT = dev
    ? Buffer.from(process.env.TLS_CERT, "base64").toString("ascii")
    : process.env.TLS_CERT;
}

if (process.env.TLS_KEY) {
  env.TLS_KEY = dev
    ? Buffer.from(process.env.TLS_KEY, "base64").toString("ascii")
    : process.env.TLS_KEY;
}

function runWorker(path: string) {
  let worker = new wt.Worker(path, { env });

  logger.info(`Worker ${path} started!`);

  worker.on("started", (msg) => {
    logger.info(`Worker ${path} started! ${msg}`);
  });

  worker.on("error", (err) => {
    logger.error({ err }, "Worker error");
  });

  worker.on("exit", () => {
    logger.info(`Process shut down ${path}!`);
    setTimeout(() => runWorker(path), 1000);
  });
}

runWorker(resolve(__dirname, "..", "server/app.js"));
runWorker(resolve(__dirname, "..", "client/server.js"));
