import { z } from "zod"

export const workspaceHealthStatusSchema = z.enum([
  "healthy",
  "degraded",
  "disconnected",
  "unknown",
])

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  path: z.string(),
  branch: z.string().optional(),
  repoUrl: z.string().optional(),
  defaultAgent: z.string().optional(),
  healthStatus: workspaceHealthStatusSchema.default("unknown"),
})

export type Workspace = z.infer<typeof workspaceSchema>
export type WorkspaceHealthStatus = z.infer<typeof workspaceHealthStatusSchema>
