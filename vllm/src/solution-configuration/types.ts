import { ISolutionConfiguration } from '@super-protocol/solution-utils';

export type RawParameters = Record<string, string | boolean | number>;

export type VllmEngineConfiguration = {
  environment?: {
    VLLM_ATTENTION_BACKEND?:
      | 'TORCH_SDPA'
      | 'FLASH_ATTN'
      | 'XFORMERS'
      | 'ROCM_FLASH'
      | 'FLASHINFER'
      | 'FLASHMLA';

    // Performance optimizations
    VLLM_USE_TRITON_FLASH_ATTN?: boolean;
    VLLM_USE_FLASHINFER_SAMPLER?: boolean;
    VLLM_FLASHINFER_FORCE_TENSOR_CORES?: boolean;
    VLLM_USE_V1?: boolean;
    VLLM_ENABLE_V1_MULTIPROCESSING?: boolean;
    VLLM_V1_USE_PREFILL_DECODE_ATTENTION?: boolean;
    VLLM_USE_AITER_UNIFIED_ATTENTION?: boolean;
    VLLM_FLASH_ATTN_VERSION?: 2 | 3;

    // Ray distributed settings
    VLLM_USE_RAY_SPMD_WORKER?: boolean;
    VLLM_USE_RAY_COMPILED_DAG?: boolean;
    VLLM_USE_RAY_COMPILED_DAG_CHANNEL_TYPE?: 'auto' | 'nccl' | 'shm';
    VLLM_USE_RAY_COMPILED_DAG_OVERLAP_COMM?: boolean;
    VLLM_USE_RAY_WRAPPED_PP_COMM?: boolean;

    // Process management
    VLLM_WORKER_MULTIPROC_METHOD?: 'fork' | 'spawn';

    // Logging system
    VLLM_CONFIGURE_LOGGING?: boolean;
    VLLM_LOGGING_CONFIG_PATH?: string;
    VLLM_LOGGING_LEVEL?: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
    VLLM_LOGGING_PREFIX?: string;
    VLLM_LOG_STATS_INTERVAL?: number;
    VLLM_TRACE_FUNCTION?: boolean;

    // Model loading behavior
    VLLM_USE_MODELSCOPE?: boolean;
    VLLM_MODEL_REDIRECT_PATH?: string;
    VLLM_ALLOW_LONG_MAX_MODEL_LEN?: boolean;

    // Engine behavior
    VLLM_ENGINE_ITERATION_TIMEOUT_S?: number;
    VLLM_RINGBUFFER_WARNING_INTERVAL?: number;
    VLLM_SLEEP_WHEN_IDLE?: boolean;
    VLLM_KEEP_ALIVE_ON_ENGINE_DEATH?: boolean;

    // Network timeouts
    VLLM_HTTP_TIMEOUT_KEEP_ALIVE?: number;
    VLLM_RPC_TIMEOUT?: number;
    VLLM_RPC_BASE_PATH?: string;

    // Media processing
    VLLM_IMAGE_FETCH_TIMEOUT?: number;
    VLLM_VIDEO_FETCH_TIMEOUT?: number;
    VLLM_AUDIO_FETCH_TIMEOUT?: number;
    VLLM_MAX_AUDIO_CLIP_FILESIZE_MB?: number;
    VLLM_MEDIA_LOADING_THREAD_COUNT?: number;
    VLLM_VIDEO_LOADER_BACKEND?: string;

    // Usage stats and telemetry
    VLLM_NO_USAGE_STATS?: boolean;
    VLLM_DO_NOT_TRACK?: boolean;
    VLLM_USAGE_SOURCE?: string;
    VLLM_USAGE_STATS_SERVER?: string;

    // Development flags
    VLLM_SERVER_DEV_MODE?: boolean;
    VLLM_DEBUG_LOG_API_SERVER_RESPONSE?: boolean;
    VLLM_SKIP_P2P_CHECK?: boolean;
    VLLM_DISABLED_KERNELS?: string[];

    // Quantization kernels
    VLLM_USE_TRITON_AWQ?: boolean;
    VLLM_MARLIN_USE_ATOMIC_ADD?: boolean;
    VLLM_MXFP4_USE_MARLIN?: boolean;

    // Plugin system
    VLLM_PLUGINS?: string[];
    VLLM_ALLOW_RUNTIME_LORA_UPDATING?: boolean;

    // Additional custom environment variables
    [key: string]: string | number | boolean | string[] | undefined;
  };

  // Server configuration
  server: {
    host?: string;
    port?: number;
    uds?: string; // Unix domain socket path
    api_server_count?: number;
    headless?: boolean;
    config?: string; // Path to YAML config file
    log_config_file?: string; // Path to logging config JSON file
  };

  // Frontend/API settings
  frontend: {
    api_key?: string[];
    allow_credentials?: boolean;
    allowed_origins?: string[];
    allowed_methods?: string[];
    allowed_headers?: string[];
    disable_fastapi_docs?: boolean;
    disable_frontend_multiprocessing?: boolean;
    disable_uvicorn_access_log?: boolean;
    enable_auto_tool_choice?: boolean;
    enable_force_include_usage?: boolean;
    enable_log_outputs?: boolean;
    enable_prompt_tokens_details?: boolean;
    enable_request_id_headers?: boolean;
    enable_server_load_tracking?: boolean;
    enable_ssl_refresh?: boolean;
    enable_tokenizer_info_endpoint?: boolean;
    exclude_tools_when_tool_choice_none?: boolean;
    h11_max_header_count?: number;
    h11_max_incomplete_event_size?: number;
    tool_call_parser?:
      | 'deepseek_v3'
      | 'glm45'
      | 'granite-20b-fc'
      | 'granite'
      | 'hermes'
      | 'hunyuan_a13b'
      | 'internlm'
      | 'jamba'
      | 'kimi_k2'
      | 'llama4_pythonic'
      | 'llama4_json'
      | 'llama3_json'
      | 'minimax'
      | 'mistral'
      | 'phi4_mini_json'
      | 'pythonic'
      | 'qwen3_coder'
      | 'step3'
      | 'xlam'
      | string;
    tool_parser_plugin?: string;
    tool_server?: string;
    chat_template?: string;
    chat_template_content_format?: 'auto' | 'openai' | 'string';
    response_role?: string;
    uvicorn_log_level?: 'critical' | 'debug' | 'error' | 'info' | 'trace' | 'warning';
    enable_log_requests?: boolean;
    disable_log_requests?: boolean; // Deprecated
    max_log_len?: number;
    middleware?: string[];
    root_path?: string; // FastAPI root_path when app is behind a path based routing proxy
    return_tokens_as_token_ids?: boolean;
  };

  // Model configuration
  model: {
    model: string; // Model name or path - required
    model_tag?: string;
    served_model_name?: string[];
    tokenizer?: string;
    tokenizer_mode?: 'auto' | 'custom' | 'mistral' | 'slow';
    tokenizer_revision?: string;
    trust_remote_code?: boolean;
    dtype?: 'auto' | 'bfloat16' | 'float' | 'float16' | 'float32' | 'half';
    max_model_len?: number;
    revision?: string;
    code_revision?: string;
    rope_scaling?: RawParameters;
    rope_theta?: number;
    seed?: number;
    hf_config_path?: string;
    hf_token?: string;
    hf_overrides?: RawParameters;
    allowed_local_media_path?: string;
    runner?: 'auto' | 'draft' | 'generate' | 'pooling';
    convert?: 'auto' | 'classify' | 'embed' | 'none' | 'reward';
    task?:
      | 'auto'
      | 'classify'
      | 'draft'
      | 'embed'
      | 'embedding'
      | 'generate'
      | 'reward'
      | 'score'
      | 'transcription'
      | null;
    config_format?: 'auto' | 'hf' | 'mistral';
    model_impl?: 'auto' | 'vllm' | 'transformers';
    enable_sleep_mode?: boolean;
    skip_tokenizer_init?: boolean;
    enable_prompt_embeds?: boolean;
    enforce_eager?: boolean;
    disable_async_output_proc?: boolean;
  };

  // Quantization and optimization
  quantization: {
    quantization?: string;
    max_seq_len_to_capture?: number;
    max_logprobs?: number;
    logprobs_mode?: 'processed_logits' | 'processed_logprobs' | 'raw_logits' | 'raw_logprobs';
    disable_sliding_window?: boolean;
    disable_cascade_attn?: boolean;
    override_attention_dtype?: string;
    logits_processors?: string[];
    logits_processor_pattern?: string;
    generation_config?: string;
    override_generation_config?: RawParameters;
    override_neuron_config?: RawParameters;
    override_pooler_config?: RawParameters;
  };

  // Loading configuration
  loading: {
    load_format?:
      | 'auto'
      | 'pt'
      | 'safetensors'
      | 'npcache'
      | 'dummy'
      | 'tensorizer'
      | 'runai_streamer'
      | 'bitsandbytes'
      | 'sharded_state'
      | 'gguf'
      | 'mistral'
      | string;
    download_dir?: string;
    model_loader_extra_config?: RawParameters;
    ignore_patterns?: string[];
    use_tqdm_on_load?: boolean;
    pt_load_map_location?: string;
  };

  // Parallel processing
  parallel: {
    tensor_parallel_size?: number;
    pipeline_parallel_size?: number;
    data_parallel_size?: number;
    data_parallel_rank?: number;
    data_parallel_start_rank?: number;
    data_parallel_size_local?: number;
    data_parallel_address?: string;
    data_parallel_rpc_port?: number;
    data_parallel_backend?: 'mp' | 'ray';
    data_parallel_hybrid_lb?: boolean;
    distributed_executor_backend?: 'external_launcher' | 'mp' | 'ray' | 'uni' | null;
    enable_expert_parallel?: boolean;
    enable_eplb?: boolean;
    num_redundant_experts?: number;
    eplb_window_size?: number;
    eplb_step_interval?: number;
    eplb_log_balancedness?: boolean;
    max_parallel_loading_workers?: number;
    ray_workers_use_nsight?: boolean;
    disable_custom_all_reduce?: boolean;
    worker_cls?: string;
    worker_extension_cls?: string;
    enable_multimodal_encoder_data_parallel?: boolean;
  };

  // Memory and caching
  cache: {
    block_size?: 1 | 8 | 16 | 32 | 64 | 128;
    gpu_memory_utilization?: number;
    kv_cache_memory_bytes?: string; // "25G", "30000M", etc.
    swap_space?: number;
    kv_cache_dtype?: 'auto' | 'fp8' | 'fp8_e4m3' | 'fp8_e5m2' | 'fp8_inc';
    num_gpu_blocks_override?: number;
    enable_prefix_caching?: boolean;
    prefix_caching_hash_algo?: 'sha256' | 'sha256_cbor';
    cpu_offload_gb?: number;
    calculate_kv_scales?: boolean;
    kv_sharing_fast_prefill?: boolean;
    mamba_cache_dtype?: 'auto' | 'float32';
    mamba_ssm_cache_dtype?: 'auto' | 'float32';
  };

  // Multimodal support
  multimodal: {
    limit_mm_per_prompt?: RawParameters;
    media_io_kwargs?: RawParameters;
    mm_processor_kwargs?: RawParameters;
    mm_processor_cache_gb?: number;
    disable_mm_preprocessor_cache?: boolean;
    interleave_mm_strings?: boolean;
    skip_mm_profiling?: boolean;
  };

  // LoRA configuration
  lora: {
    enable_lora?: boolean;
    enable_lora_bias?: boolean;
    max_loras?: number;
    max_lora_rank?: number;
    lora_extra_vocab_size?: number;
    lora_dtype?: 'auto' | 'bfloat16' | 'float16';
    max_cpu_loras?: number;
    fully_sharded_loras?: boolean;
    lora_modules?: string[]; // LoRA module configurations
    default_mm_loras?: RawParameters;
  };

  // Scheduling configuration
  scheduler: {
    max_num_batched_tokens?: number;
    max_num_seqs?: number;
    max_num_partial_prefills?: number;
    max_long_partial_prefills?: number;
    cuda_graph_sizes?: number[];
    long_prefill_token_threshold?: number;
    num_lookahead_slots?: number;
    scheduler_delay_factor?: number;
    preemption_mode?: 'recompute' | 'swap' | null;
    scheduling_policy?: 'fcfs' | 'priority';
    enable_chunked_prefill?: boolean;
    disable_chunked_mm_input?: boolean;
    scheduler_cls?: string;
    disable_hybrid_kv_cache_manager?: boolean;
    async_scheduling?: boolean;
  };

  // Guided decoding
  decoding: {
    guided_decoding_backend?: 'auto' | 'guidance' | 'outlines' | 'xgrammar';
    guided_decoding_disable_fallback?: boolean;
    guided_decoding_disable_any_whitespace?: boolean;
    guided_decoding_disable_additional_properties?: boolean;
    reasoning_parser?:
      | 'deepseek_r1'
      | 'glm45'
      | 'GptOss'
      | 'granite'
      | 'hunyuan_a13b'
      | 'mistral'
      | 'qwen3'
      | 'step3';
  };

  // Speculative decoding and advanced features
  advanced: {
    speculative_config?: RawParameters;
    kv_transfer_config?: RawParameters;
    kv_events_config?: RawParameters;
    compilation_config?: RawParameters;
    additional_config?: RawParameters;
  };

  // Observability and monitoring
  observability: {
    otlp_traces_endpoint?: string;
    collect_detailed_traces?: ('all' | 'model' | 'worker' | null)[];
    show_hidden_metrics_for_version?: string;
    enable_prompt_tokens_details?: boolean;
    enable_server_load_tracking?: boolean;
    enable_force_include_usage?: boolean;
    enable_tokenizer_info_endpoint?: boolean;
    disable_log_stats?: boolean;
    enable_log_requests?: boolean;
    disable_log_requests?: boolean;
  };

  // SSL configuration
  ssl: {
    ssl_keyfile?: string;
    ssl_certfile?: string;
    ssl_ca_certs?: string;
    enable_ssl_refresh?: boolean;
    ssl_cert_reqs?: number;
  };

  // Deprecated/Legacy options
  legacy: {
    enable_prompt_adapter?: boolean; // Deprecated - has no effect
    task?:
      | 'auto'
      | 'classify'
      | 'draft'
      | 'embed'
      | 'embedding'
      | 'generate'
      | 'reward'
      | 'score'
      | 'transcription'
      | null; // Deprecated
  };
};

// Main solution configuration type - correctly implementing the interface
export type VllmSolutionConfiguration = ISolutionConfiguration<VllmEngineConfiguration>;
