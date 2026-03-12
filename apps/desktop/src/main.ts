import Electrobun, { BrowserWindow, Utils } from "electrobun/bun"

import {
  startDaemon,
  type DaemonRuntimeHandle,
} from "../../daemon/src/bootstrap/daemon-lifecycle"
import { resolveDesktopSourceUrl } from "./desktop-source"
import {
  buildRuntimeConfigInitScript,
  resolveRuntimeConfig,
} from "./runtime-config"

type BeforeQuitEvent = {
  response?: {
    allow: boolean
  }
}

let daemonRuntime: DaemonRuntimeHandle | null = null
let daemonStopPromise: Promise<void> | null = null
let shouldQuitAfterCleanup = false

async function stopDaemonRuntime() {
  if (daemonStopPromise) {
    return daemonStopPromise
  }

  daemonStopPromise = (async () => {
    if (!daemonRuntime) {
      return
    }

    try {
      await daemonRuntime.stop()
    } finally {
      daemonRuntime = null
    }
  })().finally(() => {
    daemonStopPromise = null
  })

  return daemonStopPromise
}

function injectRuntimeConfig(window: BrowserWindow, daemonApiUrl: string) {
  const runtimeConfig = resolveRuntimeConfig({ daemonApiUrl })
  const script = buildRuntimeConfigInitScript(runtimeConfig)
  window.webview.executeJavascript(script)
}

function handleBeforeQuit(event: unknown) {
  if (shouldQuitAfterCleanup || !daemonRuntime) {
    return
  }

  const beforeQuitEvent = event as BeforeQuitEvent
  beforeQuitEvent.response = { allow: false }
  shouldQuitAfterCleanup = true

  void stopDaemonRuntime().finally(() => {
    Utils.quit()
  })
}

async function startDesktopShell() {
  daemonRuntime = await startDaemon()
  const sourceUrl = await resolveDesktopSourceUrl()

  const mainWindow = new BrowserWindow({
    title: "Mr. Burns",
    url: sourceUrl,
    renderer: "native",
    frame: {
      x: 160,
      y: 90,
      width: 1360,
      height: 900,
    },
  })

  mainWindow.webview.on("dom-ready", () => {
    if (!daemonRuntime) {
      return
    }

    injectRuntimeConfig(mainWindow, daemonRuntime.url)
  })

  mainWindow.on("close", () => {
    void stopDaemonRuntime()
  })

  Electrobun.events.on("before-quit", handleBeforeQuit)

  console.log(`[desktop] Started with UI source: ${sourceUrl}`)
  console.log(`[desktop] Daemon API URL: ${daemonRuntime.url}`)
}

startDesktopShell().catch(async (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error("[desktop] Failed to start desktop shell", error)

  await stopDaemonRuntime()

  try {
    await Utils.showMessageBox({
      type: "error",
      title: "Mr. Burns failed to start",
      message,
      buttons: ["Close"],
      defaultId: 0,
      cancelId: 0,
    })
  } catch {
    // Ignore secondary dialog errors.
  }

  process.exitCode = 1
  Utils.quit()
})
