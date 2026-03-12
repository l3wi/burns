import { describe, expect, it } from "bun:test";
import {
  buildRuntimeConfigInitScript,
  defaultRuntimeConfig,
  resolveRuntimeConfig,
} from "./runtime-config";

describe("runtime config injection", () => {
  it("injects and freezes window.__BURNS_RUNTIME_CONFIG__", () => {
    const script = buildRuntimeConfigInitScript({
      apiBaseUrl: "https://daemon.example.test",
    });

    const windowLike: Record<string, unknown> = {};
    const run = new Function("window", script) as (window: Record<string, unknown>) => void;

    run(windowLike);

    const injectedConfig = windowLike.__BURNS_RUNTIME_CONFIG__ as {
      apiBaseUrl: string;
    };

    expect(injectedConfig.apiBaseUrl).toBe("https://daemon.example.test");
    expect(Object.isFrozen(injectedConfig)).toBe(true);
  });

  it("falls back to default API base URL when env is missing", () => {
    const previousValue = process.env.BURNS_API_BASE_URL;
    delete process.env.BURNS_API_BASE_URL;

    const resolved = resolveRuntimeConfig();
    expect(resolved.apiBaseUrl).toBe(defaultRuntimeConfig.apiBaseUrl);

    if (previousValue === undefined) {
      delete process.env.BURNS_API_BASE_URL;
    } else {
      process.env.BURNS_API_BASE_URL = previousValue;
    }
  });
});
