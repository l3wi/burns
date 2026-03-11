import { Navigate } from "react-router-dom"

import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces"

export function HomePage() {
  const { data: workspaces = [], isLoading } = useWorkspaces()

  if (isLoading) {
    return <div className="p-6 text-sm text-muted-foreground">Loading workspaces…</div>
  }

  if (workspaces[0]) {
    return <Navigate to={`/w/${workspaces[0].id}/overview`} replace />
  }

  return <Navigate to="/workspaces/new" replace />
}
