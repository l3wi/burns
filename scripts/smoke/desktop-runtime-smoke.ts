import { burnsRuntimeConfigSchema } from "@mr-burns/shared"

import { startDaemon } from "../../apps/daemon/src/bootstrap/daemon-lifecycle"
import { resolveRuntimeConfig } from "../../apps/desktop/src/runtime-config"

type HealthResponse = {
  ok?: boolean
  service?: string
}

async function assertDaemonHealth(healthUrl: string) {
  const response = await fetch(healthUrl)
  if (!response.ok) {
    throw new Error(`Daemon health check failed with status ${response.status}`)
  }

  const payload = (await response.json()) as HealthResponse
  if (!payload.ok) {
    throw new Error(`Daemon health payload did not report ok=true (${JSON.stringify(payload)})`)
  }
}

async function main() {
  const runtime = await startDaemon()

  try {
    await assertDaemonHealth(runtime.healthUrl)

    const runtimeConfig = resolveRuntimeConfig({ daemonApiUrl: runtime.url })
    const parsedConfig = burnsRuntimeConfigSchema.parse(runtimeConfig)

    if (parsedConfig.runtimeMode !== "desktop") {
      throw new Error(`Expected runtimeMode=desktop, got ${String(parsedConfig.runtimeMode)}`)
    }

    if (!process.env.BURNS_DESKTOP_FORCE_API_URL && parsedConfig.burnsApiUrl !== runtime.url) {
      throw new Error(
        `Expected runtime config URL to match daemon URL (${runtime.url}), got ${parsedConfig.burnsApiUrl}`
      )
    }

    console.log(`Desktop runtime smoke passed (daemon: ${runtime.url})`)
  } finally {
    await runtime.stop()
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Desktop runtime smoke failed: ${message}`)
  process.exitCode = 1
})
