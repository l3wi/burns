import { describe, expect, it } from "bun:test"

import { DEFAULT_BURNS_API_URL, resolveBurnsApiUrl } from "./resolve-burns-api-url"

describe("resolveBurnsApiUrl", () => {
  it("prefers runtime config over env when both are valid", () => {
    const resolvedUrl = resolveBurnsApiUrl({
      runtimeConfig: { burnsApiUrl: "https://runtime.example.test:9000" },
      envBurnsApiUrl: "https://env.example.test:7332",
    })

    expect(resolvedUrl).toBe("https://runtime.example.test:9000")
  })

  it("uses env when runtime config value is missing", () => {
    const resolvedUrl = resolveBurnsApiUrl({
      runtimeConfig: {},
      envBurnsApiUrl: "https://env.example.test:7332",
    })

    expect(resolvedUrl).toBe("https://env.example.test:7332")
  })

  it("falls back to env when runtime config value is malformed", () => {
    const resolvedUrl = resolveBurnsApiUrl({
      runtimeConfig: { burnsApiUrl: "not a url" },
      envBurnsApiUrl: "https://env.example.test:7332",
    })

    expect(resolvedUrl).toBe("https://env.example.test:7332")
  })

  it("falls back to default when both runtime and env are malformed", () => {
    const resolvedUrl = resolveBurnsApiUrl({
      runtimeConfig: { burnsApiUrl: "%%%%" },
      envBurnsApiUrl: "ftp://env.example.test",
    })

    expect(resolvedUrl).toBe(DEFAULT_BURNS_API_URL)
  })

  it("falls back to default for blank values", () => {
    const resolvedUrl = resolveBurnsApiUrl({
      runtimeConfig: { burnsApiUrl: "   " },
      envBurnsApiUrl: "",
    })

    expect(resolvedUrl).toBe(DEFAULT_BURNS_API_URL)
  })
})
