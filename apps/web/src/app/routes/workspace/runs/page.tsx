import { PageHeader } from "@/components/app-shell/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { runs, workspaces } from "@/features/workspaces/mock-data"

export function WorkspaceRunsPage() {
  const workspace = workspaces[0]

  return (
    <div className="flex flex-col">
      <PageHeader title="Runs" description={`Workspace runs for ${workspace.name}.`} />
      <div className="grid gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent runs</CardTitle>
            <CardDescription>Live polling fallback + SSE enriched state.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {runs.map((run) => (
              <div key={run.id} className="flex items-center justify-between rounded-xl border px-4 py-3">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{run.id} · {run.workflowName}</p>
                  <p className="text-sm text-muted-foreground">started {run.startedAt}</p>
                </div>
                <Badge variant={run.status === "failed" ? "destructive" : "secondary"}>
                  {run.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
