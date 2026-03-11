import { listRuns } from "@/services/smithers-service"

export function handleRunRoutes(pathname: string) {
  const runsMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/runs$/)
  if (runsMatch) {
    return Response.json(listRuns(runsMatch[1]))
  }

  return null
}
