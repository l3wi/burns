import { listWorkflows } from "@/services/workflow-service"

export function handleWorkflowRoutes(pathname: string) {
  const workflowMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/workflows$/)
  if (workflowMatch) {
    return Response.json(listWorkflows(workflowMatch[1]))
  }

  return null
}
