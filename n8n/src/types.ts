export interface IServerConfig {
  engineFolder: string;
  privateKeyFilePath: string;
  certificateFilePath: string;
  port: number;
  tlsKey: string;
  tlsCert: string;
}
