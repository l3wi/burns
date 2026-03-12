export const DEFAULT_BURNS_API_URL = "http://localhost:7332"

export type BurnsRuntimeConfig = {
  burnsApiUrl?: unknown
}

type ResolveBurnsApiUrlInput = {
  runtimeConfig?: BurnsRuntimeConfig | null
  envBurnsApiUrl?: unknown
}

function parseBurnsApiUrl(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  if (!trimmedValue) {
    return null
  }

  try {
    const parsedUrl = new URL(trimmedValue)
    if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
      return null
    }

    return trimmedValue
  } catch {
    return null
  }
}

export function resolveBurnsApiUrl(input: ResolveBurnsApiUrlInput): string {
  const runtimeConfigUrl = parseBurnsApiUrl(input.runtimeConfig?.burnsApiUrl)
  if (runtimeConfigUrl) {
    return runtimeConfigUrl
  }

  const envUrl = parseBurnsApiUrl(input.envBurnsApiUrl)
  if (envUrl) {
    return envUrl
  }

  return DEFAULT_BURNS_API_URL
}

export function resolveBurnsApiUrlFromBrowserRuntime(): string {
  const runtimeConfig =
    typeof window === "undefined" ? undefined : window.__BURNS_RUNTIME_CONFIG__

  return resolveBurnsApiUrl({
    runtimeConfig,
    envBurnsApiUrl: import.meta.env.VITE_BURNS_API_URL,
  })
}
