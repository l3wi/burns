import { Outlet, useLocation } from "react-router-dom"

import { SidebarNav } from "@/components/app-shell/sidebar-nav"
import { WorkspaceSelector } from "@/components/app-shell/workspace-selector"
import { Badge } from "@/components/ui/badge"
import { useActiveWorkspace } from "@/features/workspaces/hooks/use-active-workspace"

const globalItems = [
  { label: "Workflows", to: "/workflows" },
  { label: "Add workspace", to: "/workspaces/new" },
  { label: "Settings", to: "/settings" },
]

export function AppShell() {
  const location = useLocation()
  const { workspace } = useActiveWorkspace()

  const workspaceItems = workspace
    ? [
        { label: "Overview", to: `/w/${workspace.id}/overview` },
        { label: "Runs", to: `/w/${workspace.id}/runs` },
        { label: "Approvals", to: `/w/${workspace.id}/approvals` },
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
          {workspace ? <SidebarNav title="Workspace" items={workspaceItems} /> : null}
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-2">
            {workspace ? <Badge variant="secondary">{workspace.name}</Badge> : null}
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
