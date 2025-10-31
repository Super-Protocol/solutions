export interface IUnslothEngineConfiguration {
  main_settings: {
    run_mode: RunMode;
    run_file_options?: {
      filename: string;
    };
    run_jupyter_options?: {
      password?: string;
    };
  };
}

export interface FindFileResult {
  folder: string;
  filename: string;
}

export enum RunMode {
  RunFile = "Run file",
  Jupyter = "Jupyter",
}

export interface IServerConfig {
  privateKeyFilePath: string;
  certificateFilePath: string;
  port: number;
  tlsKey: string;
  tlsCert: string;
}
