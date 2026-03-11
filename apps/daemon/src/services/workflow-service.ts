import { workflows } from "@/domain/workspaces/mock-data"

export function listWorkflows(workspaceId: string) {
  return workflows.filter((workflow) => workflow.workspaceId === workspaceId)
}
