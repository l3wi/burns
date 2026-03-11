import { workspaces } from "@/domain/workspaces/mock-data"

export function listWorkspaces() {
  return workspaces
}

export function getWorkspace(workspaceId: string) {
  return workspaces.find((workspace) => workspace.id === workspaceId) ?? null
}
