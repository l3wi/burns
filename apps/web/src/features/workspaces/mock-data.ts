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
    updatedAt: "4m ago",
  },
  {
    id: "pr-feedback",
    workspaceId: "burns-web-app",
    name: "pr-feedback",
    relativePath: ".mr-burns/workflows/pr-feedback/workflow.tsx",
    status: "hot",
    updatedAt: "12m ago",
  },
  {
    id: "approval-gate",
    workspaceId: "burns-web-app",
    name: "approval-gate",
    relativePath: ".mr-burns/workflows/approval-gate/workflow.tsx",
    status: "draft",
    updatedAt: "31m ago",
  },
]

export const runs: Run[] = [
  {
    id: "smi_abc123",
    workspaceId: "burns-web-app",
    workflowId: "issue-to-pr",
    workflowName: "issue-to-pr",
    status: "running",
    startedAt: "2m ago",
    summary: {
      finished: 3,
      inProgress: 1,
      pending: 2,
    },
  },
  {
    id: "smi_qwe998",
    workspaceId: "burns-web-app",
    workflowId: "pr-feedback",
    workflowName: "pr-feedback",
    status: "waiting-approval",
    startedAt: "18m ago",
    summary: {
      finished: 5,
      inProgress: 0,
      pending: 1,
    },
  },
]

export const approvals: Approval[] = [
  {
    id: "approval-deploy",
    workspaceId: "burns-web-app",
    runId: "smi_qwe998",
    nodeId: "deploy",
    label: "deploy",
    status: "pending",
    waitMinutes: 18,
    note: "CI passed, waiting for production approval.",
  },
]

export const selectedWorkflowSource = `export default smithers((ctx) => (\n  <Workflow name=\"issue-to-pr\">\n    <Task id=\"plan\" output=\"plan\">\n      Plan the implementation.\n    </Task>\n    <Ralph id=\"impl-loop\">\n      <Task id=\"implement\" output=\"implement\">\n        Implement using ctx.input.specPath.\n      </Task>\n      <Task id=\"validate\" output=\"validate\">\n        Run checks and summarize failures.\n      </Task>\n    </Ralph>\n  </Workflow>\n))`
