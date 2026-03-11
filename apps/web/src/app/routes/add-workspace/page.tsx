import { PageHeader } from "@/components/app-shell/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const steps = ["Workspace", "Source", "Workflows", "Confirm"]

export function AddWorkspacePage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Add workspace"
        description="Create a new managed workspace with repo source and workflow selection."
      />
      <div className="flex flex-col gap-4 p-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-4">
            {steps.map((step, index) => (
              <div key={step} className="flex items-center gap-3">
                <Badge variant={index === 0 ? "default" : "secondary"}>{index + 1}</Badge>
                <span className="text-sm font-medium">{step}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
          <Card>
            <CardHeader>
              <CardTitle>Create a workspace</CardTitle>
              <CardDescription>Start with a repo source and workflow templates.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Input defaultValue="burns-web-app" />
              <div className="rounded-xl border bg-muted px-4 py-3">
                <p className="text-sm font-medium">Clone repository</p>
                <p className="text-sm text-muted-foreground">Other options: choose folder · create new</p>
              </div>
              <Input defaultValue="github.com/acme/burns-web-app" />
              <Input defaultValue="issue-to-pr · pr-feedback · approval-gate" />
              <div className="flex items-center justify-between gap-3">
                <Button variant="outline">Back</Button>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Save draft</Button>
                  <Button>Next step</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Workspace root: /Users/lewi/MrBurns/repos</p>
                <p>Target folder: burns-web-app</p>
                <p>Agent default: Claude Code</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Included workflows</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>• issue-to-pr</p>
                <p>• pr-feedback</p>
                <p>• approval-gate</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
