import { promises as fs } from "node:fs"
import { randomUUID } from "node:crypto"
import { tmpdir } from "node:os"
import path from "node:path"

import { BaseCliAgent, pushFlag } from "@/agents/BaseCliAgent"

export class CodexAgent extends BaseCliAgent {
  protected async buildCommand(params: { prompt: string; cwd: string }) {
    const outputFile = path.join(tmpdir(), `mr-burns-codex-${randomUUID()}.txt`)
    const args = [
      "exec",
      "--skip-git-repo-check",
      "--dangerously-bypass-approvals-and-sandbox",
      "--cd",
      params.cwd,
    ]

    pushFlag(args, "--model", this.model)
    pushFlag(args, "--output-last-message", outputFile)

    if (this.extraArgs?.length) {
      args.push(...this.extraArgs)
    }

    const fullPrompt = this.systemPrompt
      ? `${this.systemPrompt}\n\n${params.prompt}`
      : params.prompt

    args.push("-")

    return {
      command: "codex",
      args,
      stdin: fullPrompt,
      outputFile,
      stdoutBannerPatterns: [/^OpenAI Codex v[^\n]*$/gm],
      cleanup: async () => {
        await fs.rm(outputFile, { force: true }).catch(() => undefined)
      },
    }
  }
}
