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
    llama_common_options1: RawParameters;
    llama_common_options2: RawParameters;
    llama_common_options3: RawParameters;
    llama_common_options4: RawParameters;
    llama_common_options5: RawParameters;
    llama_common_options6: RawParameters;
    llama_common_options7: RawParameters;
    llamacpp_hf_options: RawParameters;
    exllamav2_options: RawParameters;
    exllamav2_hf_options: RawParameters;
    autogptq_options: RawParameters;
    hqq_options: RawParameters;
  };
};

export type SolutionConfiguration = ISolutionConfiguration<EngineConfiguration>;
