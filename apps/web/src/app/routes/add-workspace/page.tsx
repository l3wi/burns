import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

import type { CreateWorkspaceInput, WorkspaceSourceType } from "@mr-burns/shared"

import { PageHeader } from "@/components/app-shell/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { useCreateWorkspace } from "@/features/workspaces/hooks/use-create-workspace"

const steps = ["Workspace", "Source", "Workflows", "Confirm"]

export function AddWorkspacePage() {
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const createWorkspace = useCreateWorkspace()

  const [name, setName] = useState("burns-web-app")
  const [sourceType, setSourceType] = useState<WorkspaceSourceType>("create")
  const [sourceValue, setSourceValue] = useState("")
  const [targetFolder, setTargetFolder] = useState("burns-web-app")

  const sourceLabel = useMemo(() => {
    if (sourceType === "local") {
      return "Local repo path"
    }

    if (sourceType === "clone") {
      return "Repository URL"
    }

    return "Target folder"
  }, [sourceType])

  async function handleCreateWorkspace() {
    const payload: CreateWorkspaceInput =
      sourceType === "local"
        ? {
            name,
            sourceType,
            localPath: sourceValue,
          }
        : sourceType === "clone"
          ? {
              name,
              sourceType,
              repoUrl: sourceValue,
              targetFolder,
            }
          : {
              name,
              sourceType,
              targetFolder,
            }

    const workspace = await createWorkspace.mutateAsync(payload)
    navigate(`/w/${workspace.id}/overview`)
  }

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
              <CardDescription>
                Start with a repo source and bootstrap the workspace folder.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Workspace name</p>
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </div>

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Source mode</p>
                <Select
                  value={sourceType}
                  onValueChange={(value) => setSourceType(value as WorkspaceSourceType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose source mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="create">Create new repo</SelectItem>
                      <SelectItem value="clone">Clone repository</SelectItem>
                      <SelectItem value="local">Add existing local repo</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              {sourceType === "local" || sourceType === "clone" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">{sourceLabel}</p>
                  <Input
                    value={sourceValue}
                    onChange={(event) => setSourceValue(event.target.value)}
                    placeholder={
                      sourceType === "local"
                        ? "/Users/lewi/Documents/ai/my-repo"
                        : "https://github.com/acme/burns-web-app.git"
                    }
                  />
                </div>
              ) : null}

              {sourceType === "clone" || sourceType === "create" ? (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-medium">Target folder</p>
                  <Input
                    value={targetFolder}
                    onChange={(event) => setTargetFolder(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">Workflow templates</p>
                <Input defaultValue="issue-to-pr · pr-feedback · approval-gate" disabled />
              </div>

              {createWorkspace.error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {createWorkspace.error.message}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" disabled>
                  Save draft
                </Button>
                <Button onClick={() => void handleCreateWorkspace()} disabled={createWorkspace.isPending}>
                  {createWorkspace.isPending ? "Creating…" : "Create workspace"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                <p>Workspace root: {settings?.workspaceRoot ?? "Loading…"}</p>
                <p>Target folder: {targetFolder || name}</p>
                <p>Agent default: {settings?.defaultAgent ?? "Loading…"}</p>
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
