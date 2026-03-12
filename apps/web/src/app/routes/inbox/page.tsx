import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function InboxPage() {
  return (
    <div className="flex h-full min-h-0 w-full min-w-0 flex-col overflow-x-hidden">
      <div className="grid w-full min-w-0 max-w-full gap-4 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Notifications and queued items from the workspace runtime.</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Inbox items will appear here as integrations are connected.
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
