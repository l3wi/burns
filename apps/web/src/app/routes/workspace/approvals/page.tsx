import { PageHeader } from "@/components/app-shell/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useApprovals } from "@/features/approvals/hooks/use-approvals"
import { useActiveWorkspace } from "@/features/workspaces/hooks/use-active-workspace"

export function WorkspaceApprovalsPage() {
  const { workspace, workspaceId } = useActiveWorkspace()
  const { data: approvals = [], isLoading } = useApprovals(workspaceId)

  return (
    <div className="flex flex-col">
      <PageHeader title="Approvals" description={`Review approval gates for ${workspace?.name ?? "selected workspace"}.`} />
      <div className="grid gap-4 p-6">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading approvals…</p>
        ) : approvals.length === 0 ? (
          <Card>
            <CardContent className="pt-4 text-sm text-muted-foreground">
              No approvals waiting for this workspace.
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval) => (
            <Card key={approval.id}>
              <CardHeader>
                <CardTitle>{approval.label}</CardTitle>
                <CardDescription>{approval.note}</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">Waiting {approval.waitMinutes} minutes</p>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Deny</Button>
                  <Button>Approve</Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
