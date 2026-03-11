import {
  type Approval,
  approvalSchema,
  type Run,
  runSchema,
  type Workflow,
  workflowSchema,
  type Workspace,
  workspaceSchema,
} from "@mr-burns/shared"
import { z } from "zod"

const workspaceListSchema = z.array(workspaceSchema)
const workflowListSchema = z.array(workflowSchema)
const runListSchema = z.array(runSchema)
const approvalListSchema = z.array(approvalSchema)

export class BurnsClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async getHealth() {
    return this.request<{ ok: true; service: string }>("/api/health")
  }

  async listWorkspaces(): Promise<Workspace[]> {
    const data = await this.request<unknown>("/api/workspaces")
    return workspaceListSchema.parse(data)
  }

  async listWorkflows(workspaceId: string): Promise<Workflow[]> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/workflows`)
    return workflowListSchema.parse(data)
  }

  async listRuns(workspaceId: string): Promise<Run[]> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/runs`)
    return runListSchema.parse(data)
  }

  async listApprovals(workspaceId: string): Promise<Approval[]> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/approvals`)
    return approvalListSchema.parse(data)
  }

  private async request<T>(pathname: string, init?: RequestInit): Promise<T> {
    const response = await fetch(new URL(pathname, this.baseUrl), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...(init?.headers ?? {}),
      },
    })

    if (!response.ok) {
      throw new Error(`Burns API request failed: ${response.status}`)
    }

    return (await response.json()) as T
  }
}
