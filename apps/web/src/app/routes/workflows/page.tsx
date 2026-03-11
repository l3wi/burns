import { WorkflowChatBox } from "@/components/code-editor/workflow-chat-box"
import { WorkflowEditorPane } from "@/components/code-editor/workflow-editor-pane"
import { PageHeader } from "@/components/app-shell/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { workflows } from "@/features/workspaces/mock-data"

export function WorkflowsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Workflows"
        description="Author and iterate on workflows for the selected workspace."
        actions={<Badge variant="secondary">{workflows.length} total</Badge>}
      />
      <div className="grid gap-4 p-6 xl:grid-cols-[20rem_1fr]">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Workspace workflows</CardTitle>
            <CardDescription>Source files under .mr-burns/workflows.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="flex items-center justify-between rounded-xl border px-3 py-3">
                <div className="flex flex-col gap-1">
                  <p className="font-medium">{workflow.name}</p>
                  <p className="text-xs text-muted-foreground">workflow.tsx</p>
                </div>
                <Badge variant="outline">{workflow.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <WorkflowEditorPane />
          <WorkflowChatBox />
        </div>
      </div>
    </div>
  )
}
