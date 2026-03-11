import { z } from "zod"

export const workflowStatusSchema = z.enum(["draft", "active", "hot", "archived"])

export const workflowSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  name: z.string(),
  relativePath: z.string(),
  status: workflowStatusSchema.default("draft"),
  updatedAt: z.string().optional(),
})

export type Workflow = z.infer<typeof workflowSchema>
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>
