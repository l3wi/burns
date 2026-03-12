/// <reference types="vite/client" />
/// <reference types="bun-types" />

type BurnsRuntimeConfig = {
  burnsApiUrl?: unknown
}

interface Window {
  __BURNS_RUNTIME_CONFIG__?: BurnsRuntimeConfig
}

interface ImportMetaEnv {
  readonly VITE_BURNS_API_URL?: string
}
