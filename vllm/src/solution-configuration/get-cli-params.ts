import { Logger } from 'pino';
import { VllmEngineConfiguration } from './types';
import { ModelDetector } from './model-detector';

// Main function to generate CLI parameters for vLLM
export const getVllmCliParams = async (params: {
  configuration?: VllmEngineConfiguration;
  engineFolder: string;
  inputDataFolder: string;
  serverPort: number;
  logger: Logger;
}): Promise<{ cliArgs: string[], envVars: Record<string, string> }> => {
  const { configuration, serverPort, inputDataFolder, logger } = params;

  if (!configuration) {
    logger.info('Configuration not found. Run with default params');
    return {
      cliArgs: ['--port', String(serverPort), '--host', '0.0.0.0'],
      envVars: {}
    };
  }

  const envVars = setupEnvironmentVariables(configuration.environment, logger);

  const cliArgs = [
    ...setupServerConfiguration(configuration.server, serverPort, logger),
    ...setupFrontendConfiguration(configuration.frontend, logger),
    ...setupModelConfiguration(configuration.model, inputDataFolder, logger),
    ...setupParallelConfiguration(configuration.parallel, logger),
    ...setupCacheConfiguration(configuration.cache, logger),
    ...setupLoraConfiguration(configuration.lora, logger),
    ...setupSchedulerConfiguration(configuration.scheduler, logger),
    ...setupQuantizationConfiguration(configuration.quantization, logger),
    ...setupLoadingConfiguration(configuration.loading, logger),
    ...setupMultimodalConfiguration(configuration.multimodal, logger),
    ...setupDecodingConfiguration(configuration.decoding, logger),
    ...setupObservabilityConfiguration(configuration.observability, logger),
    ...setupSslConfiguration(configuration.ssl, logger),
    ...setupAdvancedConfiguration(configuration.advanced, logger),
  ];

  return { cliArgs, envVars };
};

// Helper function to safely serialize JSON parameters
const serializeJsonParam = (value: any): string => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      return trimmed;
    }
    return value;
  }
  return JSON.stringify(value);
};

// Helper function to add string array parameters
const addStringArrayParam = (cliParams: string[], flag: string, values?: string[]): void => {
  if (values && values.length > 0) {
    values.forEach(value => {
      cliParams.push(`--${flag}`, value);
    });
  }
};

const setupEnvironmentVariables = (
  envSettings: VllmEngineConfiguration['environment'],
  logger: Logger,
): Record<string, string> => {
  const envVars: Record<string, string> = {};

  if (!envSettings) return envVars;

  // Convert configuration values to environment variables
  Object.entries(envSettings).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (typeof value === 'boolean') {
        envVars[key] = value ? '1' : '0';
      } else if (Array.isArray(value)) {
        envVars[key] = value.join(',');
      } else {
        envVars[key] = String(value);
      }
    }
  });

  // Log important environment settings
  if (envSettings.VLLM_ATTENTION_BACKEND) {
    logger.info(`Using attention backend: ${envSettings.VLLM_ATTENTION_BACKEND}`);
  }

  if (envSettings.VLLM_USE_V1) {
    logger.info(`vLLM V1 mode: ${envSettings.VLLM_USE_V1 ? 'enabled' : 'disabled'}`);
  }

  return envVars;
};

const setupServerConfiguration = (
  serverSettings: VllmEngineConfiguration['server'],
  serverPort: number,
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  // Default server settings
  cliParams.push('--port', String(serverPort));
  cliParams.push('--host', serverSettings?.host || '0.0.0.0');

  if (serverSettings?.uds) {
    cliParams.push('--uds', serverSettings.uds);
  }

  if (serverSettings?.api_server_count) {
    cliParams.push('--api-server-count', String(serverSettings.api_server_count));
  }

  if (serverSettings?.headless) {
    cliParams.push('--headless');
  }

  if (serverSettings?.config) {
    cliParams.push('--config', serverSettings.config);
  }

  if (serverSettings?.log_config_file) {
    cliParams.push('--log-config-file', serverSettings.log_config_file);
  }

  logger.info(`Server configuration: host=${serverSettings?.host || '0.0.0.0'}, port=${serverPort}`);
  return cliParams;
};

const setupFrontendConfiguration = (
  frontendSettings: VllmEngineConfiguration['frontend'],
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  if (!frontendSettings) return cliParams;

  addStringArrayParam(cliParams, 'api-key', frontendSettings.api_key);

  if (frontendSettings.api_key?.length) {
    logger.info('API key authentication enabled');
  }

  addBooleanFlag(cliParams, 'allow-credentials', frontendSettings.allow_credentials);
  addStringArrayParam(cliParams, 'allowed-origins', frontendSettings.allowed_origins);
  addStringArrayParam(cliParams, 'allowed-methods', frontendSettings.allowed_methods);
  addStringArrayParam(cliParams, 'allowed-headers', frontendSettings.allowed_headers);

  if (frontendSettings.chat_template) {
    cliParams.push('--chat-template', frontendSettings.chat_template);
  }

  if (frontendSettings.chat_template_content_format) {
    cliParams.push('--chat-template-content-format', frontendSettings.chat_template_content_format);
  }

  if (frontendSettings.response_role) {
    cliParams.push('--response-role', frontendSettings.response_role);
  }

  if (frontendSettings.tool_call_parser) {
    cliParams.push('--tool-call-parser', frontendSettings.tool_call_parser);
  }

  if (frontendSettings.tool_parser_plugin) {
    cliParams.push('--tool-parser-plugin', frontendSettings.tool_parser_plugin);
  }

  if (frontendSettings.tool_server) {
    cliParams.push('--tool-server', frontendSettings.tool_server);
  }

  if (frontendSettings.uvicorn_log_level) {
    cliParams.push('--uvicorn-log-level', frontendSettings.uvicorn_log_level);
  }

  if (frontendSettings.h11_max_header_count) {
    cliParams.push('--h11-max-header-count', String(frontendSettings.h11_max_header_count));
  }

  if (frontendSettings.h11_max_incomplete_event_size) {
    cliParams.push('--h11-max-incomplete-event-size', String(frontendSettings.h11_max_incomplete_event_size));
  }

  if (frontendSettings.max_log_len) {
    cliParams.push('--max-log-len', String(frontendSettings.max_log_len));
  }

  if (frontendSettings.root_path) {
    cliParams.push('--root-path', frontendSettings.root_path);
  }

  addStringArrayParam(cliParams, 'middleware', frontendSettings.middleware);

  // Boolean flags
  addBooleanFlag(cliParams, 'disable-fastapi-docs', frontendSettings.disable_fastapi_docs);
  addBooleanFlag(cliParams, 'disable-frontend-multiprocessing', frontendSettings.disable_frontend_multiprocessing);
  addBooleanFlag(cliParams, 'disable-uvicorn-access-log', frontendSettings.disable_uvicorn_access_log);
  addBooleanFlag(cliParams, 'enable-auto-tool-choice', frontendSettings.enable_auto_tool_choice);
  addBooleanFlag(cliParams, 'enable-force-include-usage', frontendSettings.enable_force_include_usage);
  addBooleanFlag(cliParams, 'enable-log-outputs', frontendSettings.enable_log_outputs);
  addBooleanFlag(cliParams, 'enable-prompt-tokens-details', frontendSettings.enable_prompt_tokens_details);
  addBooleanFlag(cliParams, 'enable-request-id-headers', frontendSettings.enable_request_id_headers);
  addBooleanFlag(cliParams, 'enable-server-load-tracking', frontendSettings.enable_server_load_tracking);
  addBooleanFlag(cliParams, 'enable-ssl-refresh', frontendSettings.enable_ssl_refresh);
  addBooleanFlag(cliParams, 'enable-tokenizer-info-endpoint', frontendSettings.enable_tokenizer_info_endpoint);
  addBooleanFlag(cliParams, 'exclude-tools-when-tool-choice-none', frontendSettings.exclude_tools_when_tool_choice_none);
  addBooleanFlag(cliParams, 'return-tokens-as-token-ids', frontendSettings.return_tokens_as_token_ids);
  addBooleanFlag(cliParams, 'enable-log-requests', frontendSettings.enable_log_requests);
  addBooleanFlag(cliParams, 'disable-log-requests', frontendSettings.disable_log_requests);

  return cliParams;
};

const setupModelConfiguration = (
  modelSettings: VllmEngineConfiguration['model'],
  inputDataFolder: string,
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  if (!modelSettings?.model) {
    logger.warn('No model specified in configuration');
  }

  // Try to detect model path or use the configured model directly
  const modelInfo = ModelDetector.detectModelPath(inputDataFolder, modelSettings.model);
  if (modelInfo) {
    cliParams.push('--model', `${modelInfo.folder}/${modelInfo.model}`);
    logger.info(`Found model ${modelInfo.model} in ${modelInfo.folder}`);
  } else {
    cliParams.push('--model', modelSettings.model);
    logger.info(`Using model: ${modelSettings.model}`);
  }

  addStringArrayParam(cliParams, 'served-model-name', modelSettings.served_model_name);

  if (modelSettings.tokenizer) {
    cliParams.push('--tokenizer', modelSettings.tokenizer);
  }

  if (modelSettings.tokenizer_mode) {
    cliParams.push('--tokenizer-mode', modelSettings.tokenizer_mode);
  }

  if (modelSettings.tokenizer_revision) {
    cliParams.push('--tokenizer-revision', modelSettings.tokenizer_revision);
  }

  if (modelSettings.dtype) {
    cliParams.push('--dtype', modelSettings.dtype);
  }

  if (modelSettings.max_model_len) {
    cliParams.push('--max-model-len', String(modelSettings.max_model_len));
  }

  if (modelSettings.revision) {
    cliParams.push('--revision', modelSettings.revision);
  }

  if (modelSettings.code_revision) {
    cliParams.push('--code-revision', modelSettings.code_revision);
  }

  if (modelSettings.seed !== undefined) {
    cliParams.push('--seed', String(modelSettings.seed));
  }

  if (modelSettings.hf_config_path) {
    cliParams.push('--hf-config-path', modelSettings.hf_config_path);
  }

  if (modelSettings.hf_token) {
    cliParams.push('--hf-token', modelSettings.hf_token);
  }

  if (modelSettings.allowed_local_media_path) {
    cliParams.push('--allowed-local-media-path', modelSettings.allowed_local_media_path);
  }

  if (modelSettings.runner) {
    cliParams.push('--runner', modelSettings.runner);
  }

  if (modelSettings.convert) {
    cliParams.push('--convert', modelSettings.convert);
  }

  if (modelSettings.task) {
    cliParams.push('--task', modelSettings.task);
  }

  if (modelSettings.config_format) {
    cliParams.push('--config-format', modelSettings.config_format);
  }

  if (modelSettings.model_impl) {
    cliParams.push('--model-impl', modelSettings.model_impl);
  }

  // JSON parameters
  if (modelSettings.rope_scaling) {
    cliParams.push('--rope-scaling', serializeJsonParam(modelSettings.rope_scaling));
  }

  if (modelSettings.rope_theta) {
    cliParams.push('--rope-theta', String(modelSettings.rope_theta));
  }

  if (modelSettings.hf_overrides) {
    cliParams.push('--hf-overrides', serializeJsonParam(modelSettings.hf_overrides));
  }

  // Boolean flags
  addBooleanFlag(cliParams, 'trust-remote-code', modelSettings.trust_remote_code);
  addBooleanFlag(cliParams, 'enforce-eager', modelSettings.enforce_eager);
  addBooleanFlag(cliParams, 'enable-sleep-mode', modelSettings.enable_sleep_mode);
  addBooleanFlag(cliParams, 'skip-tokenizer-init', modelSettings.skip_tokenizer_init);
  addBooleanFlag(cliParams, 'enable-prompt-embeds', modelSettings.enable_prompt_embeds);
  addBooleanFlag(cliParams, 'disable-async-output-proc', modelSettings.disable_async_output_proc);

  return cliParams;
};

const setupParallelConfiguration = (
  parallelSettings: VllmEngineConfiguration['parallel'],
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  if (!parallelSettings) return cliParams;

  if (parallelSettings.tensor_parallel_size) {
    cliParams.push('--tensor-parallel-size', String(parallelSettings.tensor_parallel_size));
    logger.info(`Tensor parallel size: ${parallelSettings.tensor_parallel_size}`);
  }

  if (parallelSettings.pipeline_parallel_size) {
    cliParams.push('--pipeline-parallel-size', String(parallelSettings.pipeline_parallel_size));
  }

  if (parallelSettings.data_parallel_size) {
    cliParams.push('--data-parallel-size', String(parallelSettings.data_parallel_size));
  }

  if (parallelSettings.data_parallel_rank) {
    cliParams.push('--data-parallel-rank', String(parallelSettings.data_parallel_rank));
  }

  if (parallelSettings.data_parallel_start_rank) {
    cliParams.push('--data-parallel-start-rank', String(parallelSettings.data_parallel_start_rank));
  }

  if (parallelSettings.data_parallel_size_local) {
    cliParams.push('--data-parallel-size-local', String(parallelSettings.data_parallel_size_local));
  }

  if (parallelSettings.data_parallel_address) {
    cliParams.push('--data-parallel-address', parallelSettings.data_parallel_address);
  }

  if (parallelSettings.data_parallel_rpc_port) {
    cliParams.push('--data-parallel-rpc-port', String(parallelSettings.data_parallel_rpc_port));
  }

  if (parallelSettings.data_parallel_backend) {
    cliParams.push('--data-parallel-backend', parallelSettings.data_parallel_backend);
  }

  if (parallelSettings.distributed_executor_backend) {
    cliParams.push('--distributed-executor-backend', parallelSettings.distributed_executor_backend);
  }

  if (parallelSettings.num_redundant_experts) {
    cliParams.push('--num-redundant-experts', String(parallelSettings.num_redundant_experts));
  }

  if (parallelSettings.eplb_window_size) {
    cliParams.push('--eplb-window-size', String(parallelSettings.eplb_window_size));
  }

  if (parallelSettings.eplb_step_interval) {
    cliParams.push('--eplb-step-interval', String(parallelSettings.eplb_step_interval));
  }

  if (parallelSettings.max_parallel_loading_workers) {
    cliParams.push('--max-parallel-loading-workers', String(parallelSettings.max_parallel_loading_workers));
  }

  if (parallelSettings.worker_cls) {
    cliParams.push('--worker-cls', parallelSettings.worker_cls);
  }

  if (parallelSettings.worker_extension_cls) {
    cliParams.push('--worker-extension-cls', parallelSettings.worker_extension_cls);
  }

  // Boolean flags
  addBooleanFlag(cliParams, 'data-parallel-hybrid-lb', parallelSettings.data_parallel_hybrid_lb);
  addBooleanFlag(cliParams, 'enable-expert-parallel', parallelSettings.enable_expert_parallel);
  addBooleanFlag(cliParams, 'enable-eplb', parallelSettings.enable_eplb);
  addBooleanFlag(cliParams, 'eplb-log-balancedness', parallelSettings.eplb_log_balancedness);
  addBooleanFlag(cliParams, 'ray-workers-use-nsight', parallelSettings.ray_workers_use_nsight);
  addBooleanFlag(cliParams, 'disable-custom-all-reduce', parallelSettings.disable_custom_all_reduce);
  addBooleanFlag(cliParams, 'enable-multimodal-encoder-data-parallel', parallelSettings.enable_multimodal_encoder_data_parallel);

  return cliParams;
};

const setupCacheConfiguration = (
  cacheSettings: VllmEngineConfiguration['cache'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  if (!cacheSettings) return cliParams;

  if (cacheSettings.block_size) {
    cliParams.push('--block-size', String(cacheSettings.block_size));
  }

  if (cacheSettings.gpu_memory_utilization) {
    cliParams.push('--gpu-memory-utilization', String(cacheSettings.gpu_memory_utilization));
  }

  if (cacheSettings.swap_space) {
    cliParams.push('--swap-space', String(cacheSettings.swap_space));
  }

  if (cacheSettings.kv_cache_dtype) {
    cliParams.push('--kv-cache-dtype', cacheSettings.kv_cache_dtype);
  }

  if (cacheSettings.kv_cache_memory_bytes) {
    cliParams.push('--kv-cache-memory-bytes', cacheSettings.kv_cache_memory_bytes);
  }

  if (cacheSettings.num_gpu_blocks_override) {
    cliParams.push('--num-gpu-blocks-override', String(cacheSettings.num_gpu_blocks_override));
  }

  if (cacheSettings.prefix_caching_hash_algo) {
    cliParams.push('--prefix-caching-hash-algo', cacheSettings.prefix_caching_hash_algo);
  }

  if (cacheSettings.cpu_offload_gb) {
    cliParams.push('--cpu-offload-gb', String(cacheSettings.cpu_offload_gb));
  }

  if (cacheSettings.mamba_cache_dtype) {
    cliParams.push('--mamba-cache-dtype', cacheSettings.mamba_cache_dtype);
  }

  if (cacheSettings.mamba_ssm_cache_dtype) {
    cliParams.push('--mamba-ssm-cache-dtype', cacheSettings.mamba_ssm_cache_dtype);
  }

  // Boolean flags
  addBooleanFlag(cliParams, 'enable-prefix-caching', cacheSettings.enable_prefix_caching);
  addBooleanFlag(cliParams, 'calculate-kv-scales', cacheSettings.calculate_kv_scales);
  addBooleanFlag(cliParams, 'kv-sharing-fast-prefill', cacheSettings.kv_sharing_fast_prefill);

  return cliParams;
};

const setupLoraConfiguration = (
  loraSettings: VllmEngineConfiguration['lora'],
  logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  if (!loraSettings) return cliParams;

  addBooleanFlag(cliParams, 'enable-lora', loraSettings.enable_lora);

  if (loraSettings.enable_lora) {
    logger.info('LoRA support enabled');

    if (loraSettings.max_loras) {
      cliParams.push('--max-loras', String(loraSettings.max_loras));
    }

    if (loraSettings.max_lora_rank) {
      cliParams.push('--max-lora-rank', String(loraSettings.max_lora_rank));
    }

    if (loraSettings.lora_extra_vocab_size) {
      cliParams.push('--lora-extra-vocab-size', String(loraSettings.lora_extra_vocab_size));
    }

    if (loraSettings.lora_dtype) {
      cliParams.push('--lora-dtype', loraSettings.lora_dtype);
    }

    if (loraSettings.max_cpu_loras) {
      cliParams.push('--max-cpu-loras', String(loraSettings.max_cpu_loras));
    }

    addStringArrayParam(cliParams, 'lora-modules', loraSettings.lora_modules);

    if (loraSettings.default_mm_loras) {
      cliParams.push('--default-mm-loras', serializeJsonParam(loraSettings.default_mm_loras));
    }

    addBooleanFlag(cliParams, 'enable-lora-bias', loraSettings.enable_lora_bias);
    addBooleanFlag(cliParams, 'fully-sharded-loras', loraSettings.fully_sharded_loras);
  }

  return cliParams;
};

const setupSchedulerConfiguration = (
  schedulerSettings: VllmEngineConfiguration['scheduler'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];

  if (!schedulerSettings) return cliParams;

  if (schedulerSettings.max_num_seqs) {
    cliParams.push('--max-num-seqs', String(schedulerSettings.max_num_seqs));
  }

  if (schedulerSettings.max_num_batched_tokens) {
    cliParams.push('--max-num-batched-tokens', String(schedulerSettings.max_num_batched_tokens));
  }

  if (schedulerSettings.max_num_partial_prefills) {
    cliParams.push('--max-num-partial-prefills', String(schedulerSettings.max_num_partial_prefills));
  }

  if (schedulerSettings.max_long_partial_prefills) {
    cliParams.push('--max-long-partial-prefills', String(schedulerSettings.max_long_partial_prefills));
  }

  if (schedulerSettings.cuda_graph_sizes?.length) {
    cliParams.push('--cuda-graph-sizes', ...schedulerSettings.cuda_graph_sizes.map(String));
  }

  if (schedulerSettings.long_prefill_token_threshold) {
    cliParams.push('--long-prefill-token-threshold', String(schedulerSettings.long_prefill_token_threshold));
  }

  if (schedulerSettings.num_lookahead_slots) {
    cliParams.push('--num-lookahead-slots', String(schedulerSettings.num_lookahead_slots));
  }

  if (schedulerSettings.scheduler_delay_factor) {
    cliParams.push('--scheduler-delay-factor', String(schedulerSettings.scheduler_delay_factor));
  }

  if (schedulerSettings.preemption_mode) {
    cliParams.push('--preemption-mode', schedulerSettings.preemption_mode);
  }

  if (schedulerSettings.scheduling_policy) {
    cliParams.push('--scheduling-policy', schedulerSettings.scheduling_policy);
  }

  if (schedulerSettings.scheduler_cls) {
    cliParams.push('--scheduler-cls', schedulerSettings.scheduler_cls);
  }

  // Boolean flags
  addBooleanFlag(cliParams, 'enable-chunked-prefill', schedulerSettings.enable_chunked_prefill);
  addBooleanFlag(cliParams, 'disable-chunked-mm-input', schedulerSettings.disable_chunked_mm_input);
  addBooleanFlag(cliParams, 'disable-hybrid-kv-cache-manager', schedulerSettings.disable_hybrid_kv_cache_manager);
  addBooleanFlag(cliParams, 'async-scheduling', schedulerSettings.async_scheduling);

  return cliParams;
};

const setupQuantizationConfiguration = (
  settings: VllmEngineConfiguration['quantization'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.quantization) {
    cliParams.push('--quantization', settings.quantization);
  }

  if (settings.max_seq_len_to_capture) {
    cliParams.push('--max-seq-len-to-capture', String(settings.max_seq_len_to_capture));
  }

  if (settings.max_logprobs) {
    cliParams.push('--max-logprobs', String(settings.max_logprobs));
  }

  if (settings.logprobs_mode) {
    cliParams.push('--logprobs-mode', settings.logprobs_mode);
  }

  if (settings.override_attention_dtype) {
    cliParams.push('--override-attention-dtype', settings.override_attention_dtype);
  }

  if (settings.logits_processor_pattern) {
    cliParams.push('--logits-processor-pattern', settings.logits_processor_pattern);
  }

  if (settings.generation_config) {
    cliParams.push('--generation-config', settings.generation_config);
  }

  addStringArrayParam(cliParams, 'logits-processors', settings.logits_processors);

  // JSON parameters
  if (settings.override_generation_config) {
    cliParams.push('--override-generation-config', serializeJsonParam(settings.override_generation_config));
  }

  if (settings.override_neuron_config) {
    cliParams.push('--override-neuron-config', serializeJsonParam(settings.override_neuron_config));
  }

  if (settings.override_pooler_config) {
    cliParams.push('--override-pooler-config', serializeJsonParam(settings.override_pooler_config));
  }

  // Boolean flags
  addBooleanFlag(cliParams, 'disable-sliding-window', settings.disable_sliding_window);
  addBooleanFlag(cliParams, 'disable-cascade-attn', settings.disable_cascade_attn);

  return cliParams;
};

const setupLoadingConfiguration = (
  settings: VllmEngineConfiguration['loading'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.load_format) {
    cliParams.push('--load-format', settings.load_format);
  }

  if (settings.download_dir) {
    cliParams.push('--download-dir', settings.download_dir);
  }

  if (settings.pt_load_map_location) {
    cliParams.push('--pt-load-map-location', settings.pt_load_map_location);
  }

  addStringArrayParam(cliParams, 'ignore-patterns', settings.ignore_patterns);

  if (settings.model_loader_extra_config) {
    cliParams.push('--model-loader-extra-config', serializeJsonParam(settings.model_loader_extra_config));
  }

  addBooleanFlag(cliParams, 'use-tqdm-on-load', settings.use_tqdm_on_load);

  return cliParams;
};

const setupMultimodalConfiguration = (
  settings: VllmEngineConfiguration['multimodal'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.mm_processor_cache_gb) {
    cliParams.push('--mm-processor-cache-gb', String(settings.mm_processor_cache_gb));
  }

  if (settings.limit_mm_per_prompt) {
    cliParams.push('--limit-mm-per-prompt', serializeJsonParam(settings.limit_mm_per_prompt));
  }

  if (settings.media_io_kwargs) {
    cliParams.push('--media-io-kwargs', serializeJsonParam(settings.media_io_kwargs));
  }

  if (settings.mm_processor_kwargs) {
    cliParams.push('--mm-processor-kwargs', serializeJsonParam(settings.mm_processor_kwargs));
  }

  addBooleanFlag(cliParams, 'disable-mm-preprocessor-cache', settings.disable_mm_preprocessor_cache);
  addBooleanFlag(cliParams, 'interleave-mm-strings', settings.interleave_mm_strings);
  addBooleanFlag(cliParams, 'skip-mm-profiling', settings.skip_mm_profiling);

  return cliParams;
};

const setupDecodingConfiguration = (
  settings: VllmEngineConfiguration['decoding'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.guided_decoding_backend) {
    cliParams.push('--guided-decoding-backend', settings.guided_decoding_backend);
  }

  if (settings.reasoning_parser) {
    cliParams.push('--reasoning-parser', settings.reasoning_parser);
  }

  addBooleanFlag(cliParams, 'guided-decoding-disable-fallback', settings.guided_decoding_disable_fallback);
  addBooleanFlag(cliParams, 'guided-decoding-disable-any-whitespace', settings.guided_decoding_disable_any_whitespace);
  addBooleanFlag(cliParams, 'guided-decoding-disable-additional-properties', settings.guided_decoding_disable_additional_properties);

  return cliParams;
};

const setupObservabilityConfiguration = (
  settings: VllmEngineConfiguration['observability'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.otlp_traces_endpoint) {
    cliParams.push('--otlp-traces-endpoint', settings.otlp_traces_endpoint);
  }

  if (settings.show_hidden_metrics_for_version) {
    cliParams.push('--show-hidden-metrics-for-version', settings.show_hidden_metrics_for_version);
  }

  if (settings.collect_detailed_traces?.length) {
    settings.collect_detailed_traces.forEach(trace => {
      if (trace) { // Skip null values
        cliParams.push('--collect-detailed-traces', trace);
      }
    });
  }

  // Boolean flags
  addBooleanFlag(cliParams, 'enable-prompt-tokens-details', settings.enable_prompt_tokens_details);
  addBooleanFlag(cliParams, 'enable-server-load-tracking', settings.enable_server_load_tracking);
  addBooleanFlag(cliParams, 'enable-force-include-usage', settings.enable_force_include_usage);
  addBooleanFlag(cliParams, 'enable-tokenizer-info-endpoint', settings.enable_tokenizer_info_endpoint);
  addBooleanFlag(cliParams, 'disable-log-stats', settings.disable_log_stats);
  addBooleanFlag(cliParams, 'enable-log-requests', settings.enable_log_requests);
  addBooleanFlag(cliParams, 'disable-log-requests', settings.disable_log_requests);

  return cliParams;
};

const setupSslConfiguration = (
  settings: VllmEngineConfiguration['ssl'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.ssl_keyfile) {
    cliParams.push('--ssl-keyfile', settings.ssl_keyfile);
  }

  if (settings.ssl_certfile) {
    cliParams.push('--ssl-certfile', settings.ssl_certfile);
  }

  if (settings.ssl_ca_certs) {
    cliParams.push('--ssl-ca-certs', settings.ssl_ca_certs);
  }

  if (settings.ssl_cert_reqs) {
    cliParams.push('--ssl-cert-reqs', String(settings.ssl_cert_reqs));
  }

  addBooleanFlag(cliParams, 'enable-ssl-refresh', settings.enable_ssl_refresh);

  return cliParams;
};

const setupAdvancedConfiguration = (
  settings: VllmEngineConfiguration['advanced'],
  _logger: Logger,
): string[] => {
  const cliParams: string[] = [];
  if (!settings) return cliParams;

  if (settings.additional_config) {
    cliParams.push('--additional-config', serializeJsonParam(settings.additional_config));
  }

  if (settings.compilation_config) {
    cliParams.push('--compilation-config', serializeJsonParam(settings.compilation_config));
  }

  if (settings.kv_events_config) {
    cliParams.push('--kv-events-config', serializeJsonParam(settings.kv_events_config));
  }

  if (settings.kv_transfer_config) {
    cliParams.push('--kv-transfer-config', serializeJsonParam(settings.kv_transfer_config));
  }

  if (settings.speculative_config) {
    cliParams.push('--speculative-config', serializeJsonParam(settings.speculative_config));
  }

  return cliParams;
};

// Helper function to add boolean flags
const addBooleanFlag = (cliParams: string[], flagName: string, value?: boolean): void => {
  if (value === true) {
    cliParams.push(`--${flagName}`);
  } else if (value === false) {
    cliParams.push(`--no-${flagName}`);
  }
};