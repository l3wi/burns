import { Outlet, useLocation, useParams } from "react-router-dom"

import { SidebarNav } from "@/components/app-shell/sidebar-nav"
import { WorkspaceSelector } from "@/components/app-shell/workspace-selector"
import { Badge } from "@/components/ui/badge"
import { workspaces } from "@/features/workspaces/mock-data"

const globalItems = [
  { label: "Workflows", to: "/workflows" },
  { label: "Add workspace", to: "/workspaces/new" },
  { label: "Settings", to: "/settings" },
]

export function AppShell() {
  const location = useLocation()
  const params = useParams()
  const selectedWorkspace =
    workspaces.find((workspace) => workspace.id === params.workspaceId) ?? workspaces[0]

  const workspaceItems = selectedWorkspace
    ? [
        { label: "Overview", to: `/w/${selectedWorkspace.id}/overview` },
        { label: "Runs", to: `/w/${selectedWorkspace.id}/runs` },
        { label: "Approvals", to: `/w/${selectedWorkspace.id}/approvals` },
      ]
    : []

  return (
    <div className="grid min-h-screen grid-cols-[18rem_1fr] bg-background text-foreground">
      <aside className="border-r bg-sidebar">
        <div className="flex h-full flex-col gap-6 p-4">
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              M
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold">Mr. Burns</span>
              <span className="text-xs text-muted-foreground">Smither&apos;s Manager</span>
            </div>
          </div>

          <SidebarNav title="Global" items={globalItems} />
          <WorkspaceSelector />
          {selectedWorkspace ? <SidebarNav title="Workspace" items={workspaceItems} /> : null}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            {selectedWorkspace ? <Badge variant="secondary">{selectedWorkspace.name}</Badge> : null}
            <Badge variant="outline">{location.pathname}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Inbox 3</Badge>
            <Badge>LW</Badge>
          </div>
        </header>
        <main className="min-h-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
