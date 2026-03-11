import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

export function WorkflowChatBox() {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>Workflow chat</CardTitle>
        <CardDescription>
          Prompt changes to the selected workflow and review agent-authored updates.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Textarea defaultValue="Add an approval gate before deploy and preserve stable task IDs." />
        <div className="flex justify-end">
          <Button>Send</Button>
        </div>
      </CardContent>
    </Card>
  )
}
