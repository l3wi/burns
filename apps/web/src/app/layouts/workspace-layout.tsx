import { Navigate, Outlet, useParams } from "react-router-dom"

import { workspaces } from "@/features/workspaces/mock-data"

export function WorkspaceLayout() {
  const { workspaceId } = useParams()
  const workspace = workspaces.find((entry) => entry.id === workspaceId)

  if (!workspace) {
    return <Navigate to={`/w/${workspaces[0]?.id}/overview`} replace />
  }

  return <Outlet />
}
