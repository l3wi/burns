import { runs } from "@/domain/workspaces/mock-data"

export function listRuns(workspaceId: string) {
  return runs.filter((run) => run.workspaceId === workspaceId)
}
