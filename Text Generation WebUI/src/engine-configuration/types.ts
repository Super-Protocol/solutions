import { BaseEngineConfiguration } from '@super-protocol/solution-utils';

export type RawParameters = Record<string, string | boolean | number>;

type WebUIEngineConfiguration = {
  basic_settings: {
    multi_user: boolean;
    api: {
      api_mode: boolean;
      api_key?: string;
      admin_key?: string;
    };
    character: {
      name: string;
      context: string;
      greeting: string;
    };
  };
  model: {
    model_name?: string;
    chat_buttons?: boolean;
    parameters: RawParameters;
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

export type EngineConfiguration = BaseEngineConfiguration & WebUIEngineConfiguration;
