export interface IJupyterEngineConfiguration {
  main_settings: {
    run_mode: RunMode;
    process_file_options: {
      filename?: string;
    };
  };
}

export interface FindFileResult {
  folder: string;
  filename: string;
}

export enum RunMode {
  ProcessIpynbFile = 'Process ipynb file',
  StartServer = 'Start server',
}

export interface IServerConfig {
  privateKeyFilePath: string;
  certificateFilePath: string;
  port: number;
  tlsKey: string;
  tlsCert: string;
}
