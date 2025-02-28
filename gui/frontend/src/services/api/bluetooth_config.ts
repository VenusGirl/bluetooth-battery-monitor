import { invoke } from '@tauri-apps/api/core';

export type Config = {
  /** e.g. `0` */
  address: number;

  /** e.g. `60`(minutes) == 1hour */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  battery_query_duration_minutes: number;

  /** e.g. `20`(%) */
  // biome-ignore lint/style/useNamingConvention: <explanation>
  notify_battery_level: number;
};

export const CONFIG = {
  default: {
    address: 0,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    battery_query_duration_minutes: 60,
    // biome-ignore lint/style/useNamingConvention: <explanation>
    notify_battery_level: 20,
  } as const satisfies Config,

  /**
   * Read bluetooth finder configuration
   */
  async read() {
    return await invoke<Config>('read_config');
  },

  /**
   * Read bluetooth finder configuration
   */
  async write(config: Config) {
    await invoke('write_config', { config });
  },
} as const;
