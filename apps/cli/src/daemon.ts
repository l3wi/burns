import { access } from "node:fs/promises"
import { pathToFileURL } from "node:url"

import { resolveDaemonEntrypointPath } from "./paths"

export const DEFAULT_DAEMON_API_URL = "http://localhost:7332"

async function ensureEntrypointExists(entrypointPath: string) {
  try {
    await access(entrypointPath)
  } catch {
    throw new Error(
      [
        `Daemon entrypoint not found at ${entrypointPath}.`,
        "Run this command from the Mr. Burns repository checkout.",
      ].join(" ")
    )
  }
}

export async function startDaemonFromEntrypoint() {
  const entrypointPath = resolveDaemonEntrypointPath()
  await ensureEntrypointExists(entrypointPath)

  await import(pathToFileURL(entrypointPath).href)

  return {
    apiUrl: DEFAULT_DAEMON_API_URL,
  }
}
