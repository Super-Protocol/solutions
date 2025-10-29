import { spawn } from "child_process";
import * as fs from "fs";
import { parentPort } from "worker_threads";
import { rootLogger } from "./logger";
import { getServerConfig } from "./server-config";
import { getRunJupyterOptions } from "./get-run-jupyter-options";

const logger = rootLogger.child({ module: "server.js" });

const terminationHandler = (signal: string): never => {
  logger.info(`${signal} received. Stopping`);
  process.exit(0);
};

const handledSignals = ["SIGINT", "SIGTERM"];
parentPort?.on("message", (message) => {
  if (handledSignals.includes(message)) {
    terminationHandler(message);
  }
});

const run = async (): Promise<void> => {
  const serverConfig = getServerConfig();
  const runJupyterParams = await getRunJupyterOptions();

  await fs.promises.writeFile(
    serverConfig.privateKeyFilePath,
    serverConfig.tlsKey,
    {
      mode: 0o600,
    },
  );
  await fs.promises.writeFile(
    serverConfig.certificateFilePath,
    serverConfig.tlsCert,
    {
      mode: 0o600,
    },
  );

  spawn("/usr/local/bin/entrypoint.sh", {
    stdio: "inherit",
    env: {
      ...process.env,
      ...(runJupyterParams?.password
        ? { JUPYTER_PASSWORD: runJupyterParams.password.toString() }
        : {}),
    },
  });
};

run().catch((err) => {
  logger.fatal({ err }, `Jupyter server start command failed`);
});
