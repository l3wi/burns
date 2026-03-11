import { listInstalledAgentClis } from "@/services/agent-cli-service"

export function handleAgentRoutes(pathname: string) {
  if (pathname === "/api/agents/clis") {
    return Response.json(listInstalledAgentClis())
  }

  return null
}
