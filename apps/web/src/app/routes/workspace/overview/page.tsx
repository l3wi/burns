import { useNavigate } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useApprovals } from "@/features/approvals/hooks/use-approvals"
import { useRuns } from "@/features/runs/hooks/use-runs"
import { useStartRun } from "@/features/runs/hooks/use-start-run"
import { ActivityFeedCard } from "@/features/workspace/components/activity-feed-card"
import { ServerHealthCard } from "@/features/workspace/components/server-health-card"
import { useWorkspaceServerActions } from "@/features/workspace/hooks/use-workspace-server"
import { useActiveWorkspace } from "@/features/workspaces/hooks/use-active-workspace"
import { useWorkflows } from "@/features/workflows/hooks/use-workflows"

export function WorkspaceOverviewPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { workspace, workspaceId } = useActiveWorkspace()
  const { data: workflows = [] } = useWorkflows(workspaceId)
  const { data: runs = [] } = useRuns(workspaceId)
  const { data: approvals = [] } = useApprovals(workspaceId)
  const startRun = useStartRun(workspaceId)
  const serverActions = useWorkspaceServerActions(workspaceId)
  const pendingApprovals = approvals.filter((approval) => approval.status === "pending")
  const activeRuns = runs.filter(
    (run) => run.status === "running" || run.status === "waiting-approval"
  )
  const isSelfManaged = workspace?.runtimeMode === "self-managed"
  const serverActionDisabled =
    isSelfManaged ||
    serverActions.start.isPending ||
    serverActions.restart.isPending ||
    serverActions.stop.isPending

  return (
    <div className="flex flex-col">
      <div className="grid gap-4 p-6">
        <div className="grid gap-4 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Current branch</CardTitle>
              <CardDescription>{workspace?.branch ?? "unknown"}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">workspace branch and repo context</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
              <CardDescription>{workflows.length}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {workflows.map((workflow) => workflow.name).join(" - ") || "No workflows indexed"}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active runs</CardTitle>
              <CardDescription>{activeRuns.length}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              running or waiting-approval runs
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Pending approvals</CardTitle>
              <CardDescription>{pendingApprovals.length}</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              approval gates awaiting decision
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>Common workspace operations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" onClick={() => navigate("/workflows")}>
                Open workflows
              </Button>
              <Button variant="outline" onClick={() => navigate(`/w/${workspaceId}/runs`)}>
                Open runs
              </Button>
              <Button variant="outline" onClick={() => navigate(`/w/${workspaceId}/approvals`)}>
                Open approvals
              </Button>
              <Button
                variant="outline"
                onClick={async () => {
                  await Promise.all([
                    queryClient.invalidateQueries({ queryKey: ["workspaces"] }),
                    queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] }),
                    queryClient.invalidateQueries({ queryKey: ["runs", workspaceId] }),
                    queryClient.invalidateQueries({ queryKey: ["approvals", workspaceId] }),
                  ])
                }}
              >
                Refresh workspace data
              </Button>
              <Button
                className="sm:col-span-2"
                disabled={startRun.isPending || workflows.length === 0}
                onClick={() => {
                  const defaultWorkflow = workflows[0]
                  if (!defaultWorkflow) {
                    return
                  }

                  startRun.mutate(
                    {
                      workflowId: defaultWorkflow.id,
                      input: {},
                    },
                    {
                      onSuccess: (run) => navigate(`/w/${workspaceId}/runs/${run.id}`),
                    }
                  )
                }}
              >
                {startRun.isPending ? "Starting run..." : "Start run from first workflow"}
              </Button>
              <Button
                variant="outline"
                disabled={serverActionDisabled}
                onClick={() => serverActions.restart.mutate()}
              >
                {serverActions.restart.isPending ? "Restarting server..." : "Restart server"}
              </Button>
              <Button
                variant="outline"
                disabled={serverActionDisabled}
                onClick={() => serverActions.start.mutate()}
              >
                {serverActions.start.isPending ? "Starting server..." : "Start server"}
              </Button>
              <Button
                variant="outline"
                disabled={serverActionDisabled}
                onClick={() => serverActions.stop.mutate()}
              >
                {serverActions.stop.isPending ? "Stopping server..." : "Stop server"}
              </Button>
              {startRun.error ? (
                <p className="text-sm text-destructive sm:col-span-2">{startRun.error.message}</p>
              ) : null}
              {isSelfManaged ? (
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  Server controls are disabled for self-managed workspaces.
                </p>
              ) : null}
              {serverActions.start.error ?? serverActions.restart.error ?? serverActions.stop.error ? (
                <p className="text-sm text-destructive sm:col-span-2">
                  {(serverActions.start.error ?? serverActions.restart.error ?? serverActions.stop.error)?.message}
                </p>
              ) : null}
            </CardContent>
          </Card>

          <ServerHealthCard
            workspace={workspace}
            workspaceId={workspaceId}
            title="Workspace health"
            showControls
          />
        </div>

        <ActivityFeedCard
          workspaceId={workspaceId}
          title="Recent workspace activity"
          description="Recent run events and workflow execution updates."
        />
      </div>
    </div>
  )
}
