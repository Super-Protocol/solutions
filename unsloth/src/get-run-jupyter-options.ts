import { readConfiguration } from "@super-protocol/solution-utils";
import { config } from "./config";
import { IUnslothEngineConfiguration } from "./types";

export const getRunJupyterOptions = async (): Promise<
  IUnslothEngineConfiguration["main_settings"]["run_jupyter_options"]
> => {
  const configuration = await readConfiguration(config.configurationPath);
  const engineConfiguration = configuration?.solution?.engine as
    | IUnslothEngineConfiguration
    | undefined;

  return engineConfiguration?.main_settings?.run_jupyter_options;
};
