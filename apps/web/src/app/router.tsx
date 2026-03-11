import { createBrowserRouter, Navigate } from "react-router-dom"

import { AppShell } from "@/app/layouts/app-shell"
import { WorkspaceLayout } from "@/app/layouts/workspace-layout"
import { AddWorkspacePage } from "@/app/routes/add-workspace/page"
import { SettingsPage } from "@/app/routes/settings/page"
import { WorkflowsPage } from "@/app/routes/workflows/page"
import { WorkspaceApprovalsPage } from "@/app/routes/workspace/approvals/page"
import { WorkspaceOverviewPage } from "@/app/routes/workspace/overview/page"
import { WorkspaceRunsPage } from "@/app/routes/workspace/runs/page"
import { workspaces } from "@/features/workspaces/mock-data"

const defaultWorkspaceId = workspaces[0]?.id ?? "default"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <Navigate to={`/w/${defaultWorkspaceId}/overview`} replace />,
      },
      {
        path: "workflows",
        element: <WorkflowsPage />,
      },
      {
        path: "workspaces/new",
        element: <AddWorkspacePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "w/:workspaceId",
        element: <WorkspaceLayout />,
        children: [
          {
            path: "overview",
            element: <WorkspaceOverviewPage />,
          },
          {
            path: "runs",
            element: <WorkspaceRunsPage />,
          },
          {
            path: "approvals",
            element: <WorkspaceApprovalsPage />,
          },
        ],
      },
    ],
  },
])
