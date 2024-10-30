/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from 'node:assert';
import { describe, it, mock } from 'node:test';
import { setupModelLoaderConfiguration } from './get-cli-params';

const mockLogger = {
  info: mock.fn(),
} as any;

describe('setupModelLoaderConfiguration', () => {
  it('returns correct CLI params for llamacpp', () => {
    const modelLoaderConfiguration = {
      loader_name: 'llama.cpp',
      llama_common_options1: {
        'n-gpu-layers': 33,
      },
      llama_common_options2: {
        n_ctx: 4096,
        tensor_split: 60,
        n_batch: 512,
        threads: 52,
      },
      llama_common_options3: {
        'threads-batch': 52,
        rope_freq_base: 3,
        compress_pos_emb: 1,
        'flash-attn': true,
      },
      llama_common_options4: {
        tensorcores: true,
        cache_8bit: true,
        cache_4bit: true,
      },
      llama_common_options5: {
        'streaming-llm': true,
        'attention-sink-size': 5,
        cpu: true,
      },
      llama_common_options6: {
        row_split: true,
        no_offload_kqv: true,
        no_mul_mat_q: true,
      },
      llama_common_options7: {
        'no-mmap': true,
        mlock: true,
        numa: true,
      },
    };

    const expectedResult = [
      '--loader',
      'llama.cpp',
      '--n-gpu-layers',
      '33',
      '--n_ctx',
      '4096',
      '--tensor_split',
      '60',
      '--n_batch',
      '512',
      '--threads',
      '52',
      '--threads-batch',
      '52',
      '--rope_freq_base',
      '3',
      '--compress_pos_emb',
      '1',
      '--flash-attn',
      '--tensorcores',
      '--cache_8bit',
      '--cache_4bit',
      '--streaming-llm',
      '--attention-sink-size',
      '5',
      '--cpu',
      '--row_split',
      '--no_offload_kqv',
      '--no_mul_mat_q',
      '--no-mmap',
      '--mlock',
      '--numa',
    ];

    const actualResult = setupModelLoaderConfiguration(
      modelLoaderConfiguration as any,
      mockLogger
    );

    assert.deepStrictEqual(actualResult, expectedResult);
  });

  it('returns correct CLI params for llamacpp_HF', () => {
    const modelLoaderConfiguration = {
      loader_name: 'llamacpp_HF',
      llama_common_options1: {
        'n-gpu-layers': 33,
      },
      llama_common_options2: {
        n_ctx: 4096,
        tensor_split: 60,
        n_batch: 512,
        threads: 52,
      },
      llama_common_options3: {
        'threads-batch': 52,
        rope_freq_base: 3,
        compress_pos_emb: 1,
        'flash-attn': true,
      },
      llama_common_options4: {
        tensorcores: true,
        cache_8bit: true,
        cache_4bit: true,
      },
      llama_common_options5: {
        'streaming-llm': true,
        'attention-sink-size': 5,
        cpu: true,
      },
      llama_common_options6: {
        row_split: true,
        no_offload_kqv: true,
        no_mul_mat_q: true,
      },
      llama_common_options7: {
        'no-mmap': true,
        mlock: true,
        numa: true,
      },
      llamacpp_hf_options: {
        'trust-remote-code': true,
        no_use_fast: true,
        logits_all: true,
      },
    };

    const expectedResult = [
      '--loader',
      'llamacpp_HF',
      '--n-gpu-layers',
      '33',
      '--n_ctx',
      '4096',
      '--tensor_split',
      '60',
      '--n_batch',
      '512',
      '--threads',
      '52',
      '--threads-batch',
      '52',
      '--rope_freq_base',
      '3',
      '--compress_pos_emb',
      '1',
      '--flash-attn',
      '--tensorcores',
      '--cache_8bit',
      '--cache_4bit',
      '--streaming-llm',
      '--attention-sink-size',
      '5',
      '--cpu',
      '--row_split',
      '--no_offload_kqv',
      '--no_mul_mat_q',
      '--no-mmap',
      '--mlock',
      '--numa',
      '--trust-remote-code',
      '--no_use_fast',
      '--logits_all',
    ];

    const actualResult = setupModelLoaderConfiguration(
      modelLoaderConfiguration as any,
      mockLogger
    );

    assert.deepStrictEqual(actualResult, expectedResult);
  });

  it('returns correct CLI params for ExLlamav2', () => {
    const modelLoaderConfiguration = {
      loader_name: 'ExLlamav2',
      exllamav2_common_options1: {
        'gpu-split': '40,60',
      },
      exllamav2_common_options2: {
        max_seq_len: 16384,
        compress_pos_emb: 1,
        cache_8bit: true,
        cache_4bit: true,
      },
      exllamav2_common_options3: {
        autosplit: true,
        no_flash_attn: true,
        no_xformers: true,
        no_sdpa: true,
        num_experts_per_token: 2,
      },
    };

    const expectedResult = [
      '--loader',
      'ExLlamav2',
      '--gpu-split',
      '40,60',
      '--max_seq_len',
      '16384',
      '--compress_pos_emb',
      '1',
      '--cache_8bit',
      '--cache_4bit',
      '--autosplit',
      '--no_flash_attn',
      '--no_xformers',
      '--no_sdpa',
      '--num_experts_per_token',
      '2',
    ];

    const actualResult = setupModelLoaderConfiguration(
      modelLoaderConfiguration as any,
      mockLogger
    );

    assert.deepStrictEqual(actualResult, expectedResult);
  });

  it('returns correct CLI params for ExLlamav2_HF', () => {
    const modelLoaderConfiguration = {
      loader_name: 'ExLlamav2_HF',
      exllamav2_common_options1: {
        'gpu-split': '40,60',
      },
      exllamav2_common_options2: {
        max_seq_len: 16384,
        compress_pos_emb: 1,
        cache_8bit: true,
        cache_4bit: true,
      },
      exllamav2_common_options3: {
        autosplit: true,
        no_flash_attn: true,
        no_xformers: true,
        no_sdpa: true,
        num_experts_per_token: 2,
      },
      exllamav2_hf_options: {
        'cfg-cache': true,
        'trust-remote-code': true,
        no_use_fast: true,
      },
    };

    const expectedResult = [
      '--loader',
      'ExLlamav2_HF',
      '--gpu-split',
      '40,60',
      '--max_seq_len',
      '16384',
      '--compress_pos_emb',
      '1',
      '--cache_8bit',
      '--cache_4bit',
      '--autosplit',
      '--no_flash_attn',
      '--no_xformers',
      '--no_sdpa',
      '--num_experts_per_token',
      '2',
      '--cfg-cache',
      '--trust-remote-code',
      '--no_use_fast',
    ];

    const actualResult = setupModelLoaderConfiguration(
      modelLoaderConfiguration as any,
      mockLogger
    );

    assert.deepStrictEqual(actualResult, expectedResult);
  });
});
