import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { selectedWorkflowSource, workflows } from "@/features/workspaces/mock-data"

export function WorkflowEditorPane() {
  const selectedWorkflow = workflows[0]

  return (
    <Card className="min-h-[32rem] gap-4">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <CardTitle>{selectedWorkflow.name} / workflow.tsx</CardTitle>
          <CardDescription>{selectedWorkflow.relativePath}</CardDescription>
        </div>
        <CardAction className="flex items-center gap-2">
          <Button variant="outline">New workflow</Button>
          <Button>Save</Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        <div className="min-h-[24rem] rounded-xl bg-primary px-4 py-3 text-sm text-primary-foreground">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono leading-6">
            {selectedWorkflowSource}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
