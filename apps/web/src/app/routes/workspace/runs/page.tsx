import { PageHeader } from "@/components/app-shell/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useRuns } from "@/features/runs/hooks/use-runs"
import { useActiveWorkspace } from "@/features/workspaces/hooks/use-active-workspace"

export function WorkspaceRunsPage() {
  const { workspace, workspaceId } = useActiveWorkspace()
  const { data: runs = [], isLoading } = useRuns(workspaceId)

  return (
    <div className="flex flex-col">
      <PageHeader title="Runs" description={`Workspace runs for ${workspace?.name ?? "selected workspace"}.`} />
      <div className="grid gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
            <CardDescription>Live polling fallback + SSE enriched state.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading runs…</p>
            ) : runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No runs found for this workspace.</p>
            ) : (
              runs.map((run) => (
                <div key={run.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium">{run.id} · {run.workflowName}</p>
                    <p className="text-sm text-muted-foreground">started {run.startedAt}</p>
                  </div>
                  <Badge variant={run.status === "failed" ? "destructive" : "secondary"}>
                    {run.status}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
