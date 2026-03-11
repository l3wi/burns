import { PageHeader } from "@/components/app-shell/page-header"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { approvals, runs, workflows, workspaces } from "@/features/workspaces/mock-data"

export function WorkspaceOverviewPage() {
  const workspace = workspaces[0]

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Overview"
        description={`Workspace summary for ${workspace.name}.`}
      />
      <div className="grid gap-4 p-6 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Current branch</CardTitle>
            <CardDescription>{workspace.branch}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">clean working tree</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Workflows</CardTitle>
            <CardDescription>{workflows.length}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">issue-to-pr · pr-feedback · approval-gate</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active runs</CardTitle>
            <CardDescription>{runs.filter((run) => run.status === "running").length}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">implementation loop running</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending approvals</CardTitle>
            <CardDescription>{approvals.length}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">deploy gate nearing SLA</CardContent>
        </Card>
      </div>
    </div>
  )
}
