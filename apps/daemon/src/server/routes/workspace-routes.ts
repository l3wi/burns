import { createWorkspaceInputSchema } from "@mr-burns/shared"

import { getWorkspaceHealth } from "@/services/supervisor-service"
import { createWorkspace, getWorkspace, listWorkspaces } from "@/services/workspace-service"
import { HttpError, toErrorResponse } from "@/utils/http-error"

export async function handleWorkspaceRoutes(request: Request, pathname: string) {
  try {
    if (pathname === "/api/workspaces" && request.method === "GET") {
      return Response.json(listWorkspaces())
    }

    if (pathname === "/api/workspaces" && request.method === "POST") {
      const input = createWorkspaceInputSchema.parse(await request.json())
      const workspace = createWorkspace(input)
      return Response.json(workspace, { status: 201 })
    }

    const healthMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/health$/)
    if (healthMatch && request.method === "GET") {
      return Response.json(getWorkspaceHealth(healthMatch[1]))
    }

    const workspaceMatch = pathname.match(/^\/api\/workspaces\/([^/]+)$/)
    if (workspaceMatch && request.method === "GET") {
      const workspace = getWorkspace(workspaceMatch[1])

      if (!workspace) {
        throw new HttpError(404, `Workspace not found: ${workspaceMatch[1]}`)
      }

      return Response.json(workspace)
    }

    return null
  } catch (error) {
    return toErrorResponse(error)
  }
}
