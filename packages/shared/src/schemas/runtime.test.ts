import { describe, expect, test } from "bun:test"

import {
  burnsResolvedApiUrlSchema,
  burnsRuntimeConfigSchema,
  DEFAULT_BURNS_API_URL,
  runtimeModeSchema,
} from "./runtime"

describe("runtime schemas", () => {
  test("accepts desktop runtime config with absolute URL", () => {
    const parsed = burnsRuntimeConfigSchema.parse({
      burnsApiUrl: "http://127.0.0.1:7332",
      runtimeMode: "desktop",
    })

    expect(parsed.burnsApiUrl).toBe("http://127.0.0.1:7332")
    expect(parsed.runtimeMode).toBe("desktop")
  })

  test("rejects relative runtime config URL", () => {
    expect(() =>
      burnsRuntimeConfigSchema.parse({
        burnsApiUrl: "/api",
      })
    ).toThrow()
  })

  test("supports runtime source enum", () => {
    const parsed = burnsResolvedApiUrlSchema.parse({
      apiUrl: DEFAULT_BURNS_API_URL,
      source: "fallback",
    })

    expect(parsed.source).toBe("fallback")
  })

  test("runtime mode enum contains expected values", () => {
    expect(runtimeModeSchema.options).toEqual(["dev", "desktop", "cli"])
  })
})
