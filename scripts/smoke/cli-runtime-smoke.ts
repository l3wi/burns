import { spawn, type ChildProcessWithoutNullStreams } from "node:child_process"
import path from "node:path"
import { setTimeout as sleep } from "node:timers/promises"

const REPO_ROOT = path.resolve(import.meta.dir, "../..")
const DAEMON_HEALTH_URL = process.env.BURNS_SMOKE_DAEMON_HEALTH_URL ?? "http://localhost:7332/api/health"
const WEB_URL = process.env.BURNS_SMOKE_WEB_URL ?? "http://127.0.0.1:4173"
const START_TIMEOUT_MS = Number(process.env.BURNS_SMOKE_TIMEOUT_MS ?? "90000")

type CommandResult = {
  stdout: string
  stderr: string
}

async function runCommand(command: string, args: string[], cwd: string): Promise<CommandResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    })

    let stdout = ""
    let stderr = ""

    child.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString("utf8")
    })

    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8")
    })

    child.on("error", (error) => {
      reject(error)
    })

    child.on("exit", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
        return
      }

      reject(
        new Error(
          `Command failed (${command} ${args.join(" ")}) with exit code ${String(code)}\n${stderr || stdout}`
        )
      )
    })
  })
}

async function isUrlReady(url: string) {
  try {
    const response = await fetch(url)
    return response.ok
  } catch {
    return false
  }
}

async function stopProcess(child: ChildProcessWithoutNullStreams) {
  if (child.exitCode !== null) {
    return
  }

  child.kill("SIGTERM")

  const deadline = Date.now() + 10_000
  while (child.exitCode === null && Date.now() < deadline) {
    await sleep(100)
  }

  if (child.exitCode === null) {
    child.kill("SIGKILL")
  }
}

async function main() {
  console.log("Building web assets for CLI smoke...")
  await runCommand(process.execPath, ["run", "build:web"], REPO_ROOT)

  const child = spawn(process.execPath, ["run", "apps/cli/src/bin.ts", "start"], {
    cwd: REPO_ROOT,
    stdio: ["ignore", "pipe", "pipe"],
    env: process.env,
  })

  let combinedLogs = ""
  const appendLogs = (chunk: Buffer) => {
    combinedLogs += chunk.toString("utf8")
    if (combinedLogs.length > 8_000) {
      combinedLogs = combinedLogs.slice(-8_000)
    }
  }

  child.stdout.on("data", appendLogs)
  child.stderr.on("data", appendLogs)

  try {
    const deadline = Date.now() + START_TIMEOUT_MS
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        throw new Error(`CLI process exited early with code ${String(child.exitCode)}\n${combinedLogs}`)
      }

      const [daemonReady, webReady] = await Promise.all([
        isUrlReady(DAEMON_HEALTH_URL),
        isUrlReady(WEB_URL),
      ])

      if (daemonReady && webReady) {
        console.log(`CLI runtime smoke passed (daemon: ${DAEMON_HEALTH_URL}, web: ${WEB_URL})`)
        return
      }

      await sleep(500)
    }

    throw new Error(
      `Timed out waiting for CLI runtime endpoints\n- daemon: ${DAEMON_HEALTH_URL}\n- web: ${WEB_URL}\n${combinedLogs}`
    )
  } finally {
    await stopProcess(child)
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`CLI runtime smoke failed: ${message}`)
  process.exitCode = 1
})
