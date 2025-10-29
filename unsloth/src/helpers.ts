import path from "path";
import fs from "fs";
import { FindFileResult } from "./types";
import { rootLogger } from "./logger";
import { config } from "./config";
import { spawn } from "child_process";

export const findFile = async (
  folderPath: string,
  filename: string,
): Promise<FindFileResult | undefined> => {
  const logger = rootLogger.child({ module: "findFile" });

  try {
    const filesOrDirectories = await fs.promises.readdir(folderPath, {
      withFileTypes: true,
    });
    for (const fileOrDir of filesOrDirectories) {
      if (fileOrDir.isDirectory()) {
        const subFolderPath = `${folderPath}/${fileOrDir.name}`;
        const foundFile = await findFile(subFolderPath, filename);
        if (foundFile) {
          return foundFile;
        }
      } else if (fileOrDir.name === filename) {
        return { folder: folderPath, filename: fileOrDir.name };
      }
    }
  } catch (error) {
    logger.error({ err: error }, "Error while searching for file");
    return;
  }
};

export const runPythonFile = async (filePath: string): Promise<void> => {
  const logger = rootLogger.child({ module: "runPythonFile" });
  if (!filePath.endsWith(".py")) {
    throw new Error("Provided file is not a Python (.py) file");
  }

  const filename = path.basename(filePath);

  try {
    const logPath = path.join(config.outputDataFolder, `${filename}.log`);
    const logStream = fs.createWriteStream(logPath);

    logger.info({ filePath }, `Executing python file with params`);
    const commandProcess = spawn("python", [filePath], { stdio: "pipe" });
    commandProcess.stdout.pipe(logStream);
    commandProcess.stderr.pipe(logStream);

    await new Promise((resolve, reject) => {
      commandProcess.on("close", (code) => {
        if (code === 0) resolve(void 0);
        else reject(new Error(`Process exited with code ${code}`));
      });
      commandProcess.on("error", reject);
    });
  } catch (error) {
    logger.error(
      { err: error },
      `Failed to run python file: ${filePath}. See errors in log file`,
    );
    return;
  }
};

export const runIpynbFile = async (filePath: string): Promise<void> => {
  const logger = rootLogger.child({ module: "runIpynbFile" });
  if (!filePath.endsWith(".ipynb")) {
    throw new Error("Provided file is not a Jupyter Notebook (.ipynb) file");
  }

  const filename = path.basename(filePath);

  try {
    // Run nbconvert in-place on the notebook file. Do not add shell quotes around filePath.
    const commandParams = [
      `nbconvert`,
      `--execute`,
      `--to`,
      `notebook`,
      `--inplace`,
      filePath,
      `--stdout`,
    ];

    const logPath = path.join(config.outputDataFolder, `${filename}.log`);
    const logStream = fs.createWriteStream(logPath);

    logger.info({ commandParams }, `Executing jupyter with params`);
    const commandProcess = spawn("jupyter", commandParams, { stdio: "pipe" });
    commandProcess.stdout.pipe(logStream);
    commandProcess.stderr.pipe(logStream);

    await new Promise((resolve, reject) => {
      commandProcess.on("close", (code) => {
        if (code === 0) resolve(void 0);
        else reject(new Error(`Process exited with code ${code}`));
      });
      commandProcess.on("error", reject);
    });
  } catch (error) {
    logger.error(
      { err: error },
      `Failed to run ipynb file: ${filePath}. See errors in log file`,
    );
    throw error;
  }
};
