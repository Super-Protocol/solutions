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
    extensions: {
      send_pictures: boolean;
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
    transformers_options1: RawParameters;
    transformers_options2: RawParameters;
    transformers_options3: RawParameters;
    llamacpp_llamacpp_hf_options1: RawParameters;
    llamacpp_llamacpp_hf_options2: RawParameters;
    llamacpp_llamacpp_hf_options3: RawParameters;
    llamacpp_llamacpp_hf_options4: RawParameters;
    llamacpp_llamacpp_hf_options5: RawParameters;
    llamacpp_llamacpp_hf_options6: RawParameters;
    llamacpp_llamacpp_hf_options7: RawParameters;
    llamacpp_hf_options: RawParameters;
    exllamav2_exllamav2_hf_options1: RawParameters;
    exllamav2_exllamav2_hf_options2: RawParameters;
    exllamav2_exllamav2_hf_options3: RawParameters;
    exllamav2_hf_options: RawParameters;
    autogptq_options1: RawParameters;
    autogptq_options2: RawParameters;
    autogptq_options3: RawParameters;
    autogptq_options4: RawParameters;
    autogptq_options5: RawParameters;
    hqq_options: RawParameters;
  };
};

export type SolutionConfiguration = ISolutionConfiguration<EngineConfiguration>;
