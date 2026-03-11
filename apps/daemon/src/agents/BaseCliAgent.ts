import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"

export type CliCommandSpec = {
  command: string
  args: string[]
  stdin?: string
  outputFile?: string
  cleanup?: () => Promise<void>
  stdoutBannerPatterns?: RegExp[]
  env?: Record<string, string>
}

export type BaseCliAgentOptions = {
  model?: string
  systemPrompt?: string
  yolo?: boolean
  extraArgs?: string[]
  timeoutMs?: number
  env?: Record<string, string>
}

type RunCommandResult = {
  stdout: string
  stderr: string
  exitCode: number | null
}

export function pushFlag(
  args: string[],
  flag: string,
  value?: string | number | boolean
) {
  if (value === undefined || value === false) {
    return
  }

  if (value === true) {
    args.push(flag)
    return
  }

  args.push(flag, String(value))
}

export function pushList(args: string[], flag: string, values?: string[]) {
  if (!values?.length) {
    return
  }

  args.push(flag, ...values.map(String))
}

async function runCommand(
  command: string,
  args: string[],
  options: { cwd: string; input?: string; timeoutMs?: number; env?: Record<string, string> }
): Promise<RunCommandResult> {
  return await new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: {
        ...process.env,
        ...(options.env ?? {}),
      },
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""
    let settled = false

    const timeout = options.timeoutMs
      ? setTimeout(() => {
          child.kill("SIGKILL")
          reject(new Error(`CLI timed out after ${options.timeoutMs}ms`))
        }, options.timeoutMs)
      : null

    const finish = (result: RunCommandResult) => {
      if (settled) {
        return
      }

      settled = true
      if (timeout) {
        clearTimeout(timeout)
      }
      resolve(result)
    }

    child.stdout?.on("data", (chunk) => {
      stdout += chunk.toString("utf8")
    })

    child.stderr?.on("data", (chunk) => {
      stderr += chunk.toString("utf8")
    })

    child.on("error", (error) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      reject(error)
    })

    child.on("close", (code) => {
      finish({
        stdout,
        stderr,
        exitCode: code,
      })
    })

    if (options.input) {
      child.stdin?.write(options.input)
    }
    child.stdin?.end()
  })
}

export abstract class BaseCliAgent {
  protected readonly model?: string
  protected readonly systemPrompt?: string
  protected readonly yolo: boolean
  protected readonly extraArgs?: string[]
  protected readonly timeoutMs?: number
  protected readonly env?: Record<string, string>

  constructor(options: BaseCliAgentOptions) {
    this.model = options.model
    this.systemPrompt = options.systemPrompt
    this.yolo = options.yolo ?? true
    this.extraArgs = options.extraArgs
    this.timeoutMs = options.timeoutMs ?? 180_000
    this.env = options.env
  }

  async generate(params: { prompt: string; cwd: string }) {
    const commandSpec = await this.buildCommand(params)

    try {
      const result = await runCommand(commandSpec.command, commandSpec.args, {
        cwd: params.cwd,
        input: commandSpec.stdin,
        timeoutMs: this.timeoutMs,
        env: {
          ...(this.env ?? {}),
          ...(commandSpec.env ?? {}),
        },
      })

      const stdout = commandSpec.outputFile
        ? await fs.readFile(commandSpec.outputFile, "utf8").catch(() => result.stdout)
        : result.stdout

      if (result.exitCode && result.exitCode !== 0) {
        throw new Error(result.stderr.trim() || stdout.trim() || `CLI exited with code ${result.exitCode}`)
      }

      let cleanedStdout = stdout
      for (const pattern of commandSpec.stdoutBannerPatterns ?? []) {
        cleanedStdout = cleanedStdout.replace(pattern, "")
      }

      return cleanedStdout.trim()
    } finally {
      await commandSpec.cleanup?.().catch(() => undefined)
    }
  }

  protected abstract buildCommand(params: {
    prompt: string
    cwd: string
  }): Promise<CliCommandSpec>
}
