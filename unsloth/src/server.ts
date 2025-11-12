import { spawn, execFileSync } from "child_process";
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

  let notebookPasswordArg = `--NotebookApp.password=''`;
  if (runJupyterParams?.password) {
    try {
      const hashed = execFileSync(
        "python",
        [
          "-c",
          "import os; from jupyter_server.auth import passwd; print(passwd(os.environ['JUPYTER_PASSWORD']))",
        ],
        {
          env: {
            ...process.env,
            JUPYTER_PASSWORD: runJupyterParams.password.toString(),
          },
        },
      )
        .toString()
        .trim();
      notebookPasswordArg = `--NotebookApp.password='${hashed}'`;
    } catch (err) {
      logger.warn(
        { err },
        "Failed to generate hashed Jupyter password, falling back to empty password",
      );
    }
  }

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

  spawn(
    "jupyter",
    [
      `notebook`,
      `--NotebookApp.token=''`,
      notebookPasswordArg,
      `--certfile=${serverConfig.certificateFilePath}`,
      `--keyfile=${serverConfig.privateKeyFilePath}`,
      `--port=${serverConfig.port}`,
      `--notebook-dir=${runJupyterParams?.start_dir || `/workspace`}`,
      `--NotebookApp.allow_origin='*'`,
      `--NotebookApp.disable_check_xsrf=True`,
      `--ServerApp.allow_remote_access=True`,
      `--allow-root`,
      `--no-browser`,
      `-y`,
    ],
    {
      stdio: "inherit",
      env: {
        ...process.env,
      },
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
