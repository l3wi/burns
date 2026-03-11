import {
  type AgentCli,
  agentCliSchema,
  type Approval,
  approvalSchema,
  type CreateWorkspaceInput,
  type EditWorkflowInput,
  type GenerateWorkflowInput,
  type Run,
  runSchema,
  type Settings,
  settingsSchema,
  type UpdateWorkflowInput,
  type Workflow,
  type WorkflowDocument,
  workflowDocumentSchema,
  workflowSchema,
  type Workspace,
  workspaceSchema,
} from "@mr-burns/shared"
import { z } from "zod"

const workspaceListSchema = z.array(workspaceSchema)
const workflowListSchema = z.array(workflowSchema)
const workflowDocumentListSchema = workflowDocumentSchema
const agentCliListSchema = z.array(agentCliSchema)
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

  async getWorkspace(workspaceId: string): Promise<Workspace> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}`)
    return workspaceSchema.parse(data)
  }

  async createWorkspace(input: CreateWorkspaceInput): Promise<Workspace> {
    const data = await this.request<unknown>("/api/workspaces", {
      method: "POST",
      body: JSON.stringify(input),
    })

    return workspaceSchema.parse(data)
  }

  async getSettings(): Promise<Settings> {
    const data = await this.request<unknown>("/api/settings")
    return settingsSchema.parse(data)
  }

  async listAgentClis(): Promise<AgentCli[]> {
    const data = await this.request<unknown>("/api/agents/clis")
    return agentCliListSchema.parse(data)
  }

  async listWorkflows(workspaceId: string): Promise<Workflow[]> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/workflows`)
    return workflowListSchema.parse(data)
  }

  async getWorkflow(workspaceId: string, workflowId: string): Promise<WorkflowDocument> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/workflows/${workflowId}`)
    return workflowDocumentListSchema.parse(data)
  }

  async saveWorkflow(
    workspaceId: string,
    workflowId: string,
    source: UpdateWorkflowInput["source"]
  ): Promise<WorkflowDocument> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/workflows/${workflowId}`, {
      method: "PUT",
      body: JSON.stringify({ source }),
    })

    return workflowDocumentListSchema.parse(data)
  }

  async generateWorkflow(
    workspaceId: string,
    input: GenerateWorkflowInput
  ): Promise<WorkflowDocument> {
    const data = await this.request<unknown>(`/api/workspaces/${workspaceId}/workflows/generate`, {
      method: "POST",
      body: JSON.stringify(input),
    })

    return workflowDocumentListSchema.parse(data)
  }

  async editWorkflow(
    workspaceId: string,
    workflowId: string,
    input: EditWorkflowInput
  ): Promise<WorkflowDocument> {
    const data = await this.request<unknown>(
      `/api/workspaces/${workspaceId}/workflows/${workflowId}/edit`,
      {
        method: "POST",
        body: JSON.stringify(input),
      }
    )

    return workflowDocumentListSchema.parse(data)
  }

  async deleteWorkflow(workspaceId: string, workflowId: string): Promise<void> {
    await this.request(`/api/workspaces/${workspaceId}/workflows/${workflowId}`, {
      method: "DELETE",
    })
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
      let message = `Burns API request failed: ${response.status}`

      try {
        const errorBody = (await response.json()) as { error?: string }
        if (errorBody.error) {
          message = errorBody.error
        }
      } catch {
        // Ignore invalid JSON error bodies.
      }

      throw new Error(message)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }
}
