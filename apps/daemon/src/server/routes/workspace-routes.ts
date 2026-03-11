import { getWorkspaceHealth } from "@/services/supervisor-service"
import { listWorkspaces } from "@/services/workspace-service"

export function handleWorkspaceRoutes(pathname: string) {
  if (pathname === "/api/workspaces") {
    return Response.json(listWorkspaces())
  }

  const healthMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/health$/)
  if (healthMatch) {
    return Response.json(getWorkspaceHealth(healthMatch[1]))
  }

  return null
}
