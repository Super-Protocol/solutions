import { ISolutionConfiguration } from '@super-protocol/solution-utils';

export type RawParameters = Record<string, string | boolean | number>;

export type EngineConfiguration = {
  main_settings: {
    character: {
      name: string;
      context: string;
      greeting: string;
    };
    api: {
      api_mode: boolean;
      api_key?: string;
      admin_key?: string;
    };
    mode: {
      multi_user: boolean;
    };
  };
  model: {
    model_name?: string;
    chat_buttons?: boolean;
    parameters: RawParameters;
    parameters2: RawParameters;
  };
  model_loader: {
    loader_name: string;
    transformers_options: RawParameters;
    llamacpp_options: RawParameters;
    llamacpp_hf_options: RawParameters;
    exllamav2_options: RawParameters;
    exllamav2_hf_options: RawParameters;
    autogptq_options: RawParameters;
    hqq_options: RawParameters;
  };
};

export type SolutionConfiguration = ISolutionConfiguration<EngineConfiguration>;
