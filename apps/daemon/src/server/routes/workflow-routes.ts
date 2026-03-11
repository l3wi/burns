import {
  editWorkflowInputSchema,
  generateWorkflowInputSchema,
  updateWorkflowInputSchema,
} from "@mr-burns/shared"

import {
  deleteWorkflow,
  editWorkflowFromPrompt,
  generateWorkflowFromPrompt,
  getWorkflow,
  listWorkflows,
  saveWorkflow,
} from "@/services/workflow-service"
import { toErrorResponse } from "@/utils/http-error"

export async function handleWorkflowRoutes(request: Request, pathname: string) {
  try {
    const workflowGenerateMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/workflows\/generate$/)
    if (workflowGenerateMatch && request.method === "POST") {
      const input = generateWorkflowInputSchema.parse(await request.json())
      return Response.json(
        await generateWorkflowFromPrompt({
          workspaceId: workflowGenerateMatch[1],
          ...input,
        }),
        { status: 201 }
      )
    }

    const workflowEditMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/workflows\/([^/]+)\/edit$/)
    if (workflowEditMatch && request.method === "POST") {
      const input = editWorkflowInputSchema.parse(await request.json())
      return Response.json(
        await editWorkflowFromPrompt({
          workspaceId: workflowEditMatch[1],
          workflowId: workflowEditMatch[2],
          ...input,
        })
      )
    }

    const workflowDetailMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/workflows\/([^/]+)$/)
    if (workflowDetailMatch && request.method === "GET") {
      return Response.json(getWorkflow(workflowDetailMatch[1], workflowDetailMatch[2]))
    }

    if (workflowDetailMatch && request.method === "PUT") {
      const input = updateWorkflowInputSchema.parse(await request.json())
      return Response.json(saveWorkflow(workflowDetailMatch[1], workflowDetailMatch[2], input.source))
    }

    if (workflowDetailMatch && request.method === "DELETE") {
      deleteWorkflow(workflowDetailMatch[1], workflowDetailMatch[2])
      return new Response(null, { status: 204 })
    }

    const workflowMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/workflows$/)
    if (workflowMatch && request.method === "GET") {
      return Response.json(listWorkflows(workflowMatch[1]))
    }

    return null
  } catch (error) {
    return toErrorResponse(error)
  }
}
