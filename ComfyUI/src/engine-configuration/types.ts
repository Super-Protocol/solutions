import { TunnelsConfiguration } from '@super-protocol/solution-utils';

export interface ComfyuiConfiguration {
  tunnels: TunnelsConfiguration;
  engine: {
    main_settings: {
      comfyui_manager_enable: boolean;
      compute?: string;
      enable_cors_header?: boolean;
      cuda_malloc?: 'Enable' | 'Disable';
      fp?: string;
      fpunet?: string;
      fpvae?: string;
      cpu_vae?: string;
      text_enc?: string;
      force_channel_last?: boolean;
      preview_method: string;
      preview_size: number;
      upcast_attestation?: string;
      disable_smart_memory?: boolean;
      deterministic?: boolean;
    };
  };
}
