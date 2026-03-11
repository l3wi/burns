import { PageHeader } from "@/components/app-shell/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { approvals, workspaces } from "@/features/workspaces/mock-data"

export function WorkspaceApprovalsPage() {
  const workspace = workspaces[0]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Approvals"
        description={`Review approval gates for ${workspace.name}.`}
      />
      <div className="grid gap-4 p-6">
        {approvals.map((approval) => (
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
        ))}
      </div>
    </div>
  )
}
