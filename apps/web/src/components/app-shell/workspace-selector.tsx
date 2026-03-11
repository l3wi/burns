import { useNavigate, useParams } from "react-router-dom"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { workspaces } from "@/features/workspaces/mock-data"

export function WorkspaceSelector() {
  const navigate = useNavigate()
  const params = useParams()
  const selectedWorkspaceId = params.workspaceId ?? workspaces[0]?.id

  return (
    <div className="flex flex-col gap-3 rounded-xl border bg-card p-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">Workspace</p>
        <p className="text-xs text-muted-foreground">Switch the active repo context.</p>
      </div>
      <Select
        value={selectedWorkspaceId}
        onValueChange={(value) => navigate(`/w/${value}/overview`)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a workspace" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {workspaces.map((workspace) => (
              <SelectItem key={workspace.id} value={workspace.id}>
                {workspace.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {workspaces[0] ? (
        <div className="flex flex-col gap-1 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span>{workspaces[0].branch ?? "main"}</span>
          <span className="truncate">{workspaces[0].path}</span>
        </div>
      ) : null}
    </div>
  )
}
