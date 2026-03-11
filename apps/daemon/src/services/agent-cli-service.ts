import type { AgentCli } from "@mr-burns/shared"

import { createCliAgent, supportedAgentClis } from "@/agents"
import { HttpError } from "@/utils/http-error"

function resolveBinaryPath(command: string) {
  const result = Bun.spawnSync(["which", command], {
    stdout: "pipe",
    stderr: "pipe",
  })

  if (result.exitCode !== 0) {
    return null
  }

  const binaryPath = result.stdout.toString("utf8").trim()
  return binaryPath || null
}

export function listInstalledAgentClis(): AgentCli[] {
  const installedAgents: AgentCli[] = []

  for (const agent of supportedAgentClis) {
    const binaryPath = resolveBinaryPath(agent.command)
    if (!binaryPath) {
      continue
    }

    installedAgents.push({
      ...agent,
      binaryPath,
    })
  }

  return installedAgents
}

export function runWorkflowGenerationAgent(params: {
  agentId: string
  prompt: string
  cwd: string
  systemPrompt: string
}) {
  const installedAgent = listInstalledAgentClis().find((agent) => agent.id === params.agentId)

  if (!installedAgent) {
    throw new HttpError(404, `Agent CLI not installed: ${params.agentId}`)
  }

  const agent = createCliAgent(params.agentId, params.systemPrompt)
  return agent.generate({
    prompt: params.prompt,
    cwd: params.cwd,
  })
}
