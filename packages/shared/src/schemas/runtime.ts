import { z } from "zod"

export const DEFAULT_BURNS_API_URL = "http://localhost:7332"

export const runtimeModeSchema = z.enum(["dev", "desktop", "cli"])

export const burnsRuntimeConfigSchema = z.object({
  burnsApiUrl: z.string().url(),
  runtimeMode: runtimeModeSchema.optional(),
})

export const burnsRuntimeApiUrlSourceSchema = z.enum([
  "runtime-config",
  "vite-env",
  "fallback",
])

export const burnsResolvedApiUrlSchema = z.object({
  apiUrl: z.string().url(),
  source: burnsRuntimeApiUrlSourceSchema,
})

export type RuntimeMode = z.infer<typeof runtimeModeSchema>
export type BurnsRuntimeConfig = z.infer<typeof burnsRuntimeConfigSchema>
export type BurnsRuntimeApiUrlSource = z.infer<typeof burnsRuntimeApiUrlSourceSchema>
export type BurnsResolvedApiUrl = z.infer<typeof burnsResolvedApiUrlSchema>
