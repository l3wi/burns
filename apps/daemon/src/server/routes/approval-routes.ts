import { approvals } from "@/domain/workspaces/mock-data"

export function handleApprovalRoutes(pathname: string) {
  const approvalsMatch = pathname.match(/^\/api\/workspaces\/([^/]+)\/approvals$/)
  if (approvalsMatch) {
    return Response.json(
      approvals.filter((approval) => approval.workspaceId === approvalsMatch[1])
    )
  }

  return null
}
