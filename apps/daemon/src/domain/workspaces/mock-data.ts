import type { Approval, Run, Workflow, Workspace } from "@mr-burns/shared"

export const workspaces: Workspace[] = [
  {
    id: "burns-web-app",
    name: "burns-web-app",
    path: "/Users/lewi/MrBurns/repos/burns-web-app",
    branch: "main",
    repoUrl: "github.com/acme/burns-web-app",
    defaultAgent: "Claude Code",
    healthStatus: "healthy",
  },
]

export const workflows: Workflow[] = [
  {
    id: "issue-to-pr",
    workspaceId: "burns-web-app",
    name: "issue-to-pr",
    relativePath: ".mr-burns/workflows/issue-to-pr/workflow.tsx",
    status: "active",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "pr-feedback",
    workspaceId: "burns-web-app",
    name: "pr-feedback",
    relativePath: ".mr-burns/workflows/pr-feedback/workflow.tsx",
    status: "hot",
    updatedAt: new Date().toISOString(),
  },
]

export const runs: Run[] = [
  {
    id: "smi_abc123",
    workspaceId: "burns-web-app",
    workflowId: "issue-to-pr",
    workflowName: "issue-to-pr",
    status: "running",
    startedAt: new Date().toISOString(),
    summary: {
      finished: 3,
      inProgress: 1,
      pending: 2,
    },
  },
]

export const approvals: Approval[] = [
  {
    id: "approval-deploy",
    workspaceId: "burns-web-app",
    runId: "smi_abc123",
    nodeId: "deploy",
    label: "deploy",
    status: "pending",
    waitMinutes: 18,
    note: "CI passed. Waiting for operator approval.",
  },
]
