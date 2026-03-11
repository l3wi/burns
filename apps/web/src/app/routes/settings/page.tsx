import { PageHeader } from "@/components/app-shell/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SettingsPage() {
  return (
    <div className="flex flex-col">
      <PageHeader
        title="Settings"
        description="Configure global Mr. Burns settings, agent defaults, and workspace root."
      />
      <div className="grid gap-4 p-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Server configuration</CardTitle>
            <CardDescription>Defaults used by the Burns daemon.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="rounded-xl border bg-muted px-4 py-3">authToken: SMITHERS_API_KEY</div>
            <div className="rounded-xl border bg-muted px-4 py-3">rootDir: /home/workflows</div>
            <div className="rounded-xl border bg-muted px-4 py-3">allowNetwork: false</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Save changes</CardTitle>
            <CardDescription>Restart required only for schema or registry changes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Apply now</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
