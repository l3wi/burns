import { z } from "zod"

export const runStatusSchema = z.enum([
  "running",
  "waiting-approval",
  "finished",
  "failed",
  "cancelled",
])

export const runSummarySchema = z.object({
  finished: z.number(),
  inProgress: z.number(),
  pending: z.number(),
})

export const runSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  workflowId: z.string(),
  workflowName: z.string(),
  status: runStatusSchema,
  startedAt: z.string(),
  finishedAt: z.string().nullable().optional(),
  summary: runSummarySchema,
})

export type Run = z.infer<typeof runSchema>
export type RunStatus = z.infer<typeof runStatusSchema>
export type RunSummary = z.infer<typeof runSummarySchema>
