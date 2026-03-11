import { getWorkspace } from "@/services/workspace-service"

export function getWorkspaceHealth(workspaceId: string) {
  const workspace = getWorkspace(workspaceId)

  return {
    workspaceId,
    status: workspace?.healthStatus ?? "unknown",
    heartbeatAt: new Date().toISOString(),
  }
}
