export interface BurnsRuntimeConfig {
  apiBaseUrl: string;
}

export const defaultRuntimeConfig: BurnsRuntimeConfig = {
  apiBaseUrl: "http://127.0.0.1:7332",
};

export function resolveRuntimeConfig(): BurnsRuntimeConfig {
  return {
    apiBaseUrl: process.env.BURNS_API_BASE_URL ?? defaultRuntimeConfig.apiBaseUrl,
  };
}

export function buildRuntimeConfigInitScript(config: BurnsRuntimeConfig): string {
  const payload = JSON.stringify(config);
  return `window.__BURNS_RUNTIME_CONFIG__ = Object.freeze(${payload});`;
}
