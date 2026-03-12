#!/usr/bin/env bun

import { startDaemonFromEntrypoint } from "./daemon"
import { openInBrowser } from "./open-browser"
import { parseCliArgs } from "./args"
import { renderUsage } from "./usage"
import { getMissingWebBuildGuidance, hasBuiltWebApp, startWebServer } from "./web"

async function run() {
  const parsed = parseCliArgs(process.argv.slice(2))

  if (!parsed.ok) {
    console.error(parsed.error)
    console.error()
    console.error(renderUsage())
    return 1
  }

  const { command } = parsed

  if (command.kind === "help") {
    console.log(renderUsage(command.topic))
    return 0
  }

  if (command.kind === "daemon") {
    const { apiUrl } = await startDaemonFromEntrypoint()
    console.log(`Daemon listening at ${apiUrl}`)
    return 0
  }

  if (command.kind === "start") {
    const { apiUrl } = await startDaemonFromEntrypoint()
    console.log(`Daemon listening at ${apiUrl}`)

    if (command.openWeb) {
      const openResult = await openInBrowser(command.webUrl)
      if (!openResult.ok) {
        console.error(`Failed to open browser: ${openResult.error}`)
        console.error(`Open this URL manually: ${command.webUrl}`)
      } else {
        console.log(`Opened web URL: ${command.webUrl}`)
      }
    }

    return 0
  }

  if (!(await hasBuiltWebApp())) {
    console.error(getMissingWebBuildGuidance())
    return 1
  }

  const runningWebServer = startWebServer({
    host: command.host,
    port: command.port,
  })

  console.log(`Serving web UI at ${runningWebServer.url}`)

  if (command.openWeb) {
    const openResult = await openInBrowser(runningWebServer.url)
    if (!openResult.ok) {
      console.error(`Failed to open browser: ${openResult.error}`)
      console.error(`Open this URL manually: ${runningWebServer.url}`)
    }
  }

  const stopServer = () => {
    runningWebServer.stop()
  }

  process.on("SIGINT", stopServer)
  process.on("SIGTERM", stopServer)

  return await new Promise<number>((resolve) => {
    process.once("SIGINT", () => resolve(0))
    process.once("SIGTERM", () => resolve(0))
  })
}

run()
  .then((exitCode) => {
    process.exitCode = exitCode
  })
  .catch((error: unknown) => {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }
    process.exitCode = 1
  })
