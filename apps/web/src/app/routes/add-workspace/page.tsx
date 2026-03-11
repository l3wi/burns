import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react"
import { useNavigate } from "react-router-dom"

import type { CreateWorkspaceInput, WorkspaceSourceType } from "@mr-burns/shared"
import { FolderOpenIcon } from "lucide-react"

import {
  Combobox11,
  type Combobox11Option,
} from "@/components/shadcn-studio/combobox/combobox-11"
import { Button } from "@/components/ui/button"
import {
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useSettings } from "@/features/settings/hooks/use-settings"
import { useCreateWorkspace } from "@/features/workspaces/hooks/use-create-workspace"

const workflowTemplateOptions = [
  { value: "issue-to-pr", label: "Issue to PR" },
  { value: "pr-feedback", label: "PR feedback" },
  { value: "approval-gate", label: "Approval gate" },
] satisfies Combobox11Option[]

type WorkspaceSourceMode = Extract<WorkspaceSourceType, "clone" | "create">

type NativeFolderPickerFieldProps = {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  pickerLabel: string
}

type FileWithPath = File & {
  webkitRelativePath?: string
}

function extractFolderSelection(files: FileList) {
  const first = files.item(0) as FileWithPath | null
  if (!first) {
    return ""
  }

  const relativePath = first.webkitRelativePath ?? ""
  return relativePath.split("/").filter(Boolean)[0] ?? ""
}

function NativeFolderPickerField({
  id,
  value,
  onChange,
  placeholder,
  pickerLabel,
}: NativeFolderPickerFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [pickerNote, setPickerNote] = useState<string>("")

  useEffect(() => {
    const input = inputRef.current
    if (!input) {
      return
    }

    input.setAttribute("webkitdirectory", "")
    input.setAttribute("directory", "")
  }, [])

  async function handleBrowseClick() {
    if (typeof window !== "undefined" && "showDirectoryPicker" in window) {
      try {
        const picker = window as Window & {
          showDirectoryPicker?: () => Promise<{ name: string }>
        }
        const selectedDirectory = await picker.showDirectoryPicker?.()

        if (selectedDirectory?.name) {
          onChange(selectedDirectory.name)
          setPickerNote("")
        }

        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return
        }
      }
    }

    inputRef.current?.click()
  }

  function handleInputPickerChange(event: ChangeEvent<HTMLInputElement>) {
    const files = event.currentTarget.files
    if (!files?.length) {
      return
    }

    const selectedFolder = extractFolderSelection(files)
    if (selectedFolder) {
      onChange(selectedFolder)
      setPickerNote("")
    } else {
      setPickerNote("Could not determine selected folder name from browser picker.")
    }

    event.currentTarget.value = ""
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
        <Button type="button" variant="outline" onClick={() => void handleBrowseClick()}>
          <FolderOpenIcon data-icon="inline-start" />
          {pickerLabel}
        </Button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleInputPickerChange}
        />
      </div>
      {pickerNote ? <FieldDescription>{pickerNote}</FieldDescription> : null}
    </div>
  )
}

type FormRowProps = {
  label: string
  htmlFor?: string
  description?: ReactNode
  children: ReactNode
}

function FormRow({ label, htmlFor, description, children }: FormRowProps) {
  return (
    <div className="grid gap-3 border-b py-4 md:grid-cols-[12rem_minmax(0,1fr)] md:items-start md:gap-6">
      <div className="space-y-1">
        <FieldLabel htmlFor={htmlFor} className="text-sm md:pt-2">
          {label}
        </FieldLabel>
      </div>
      <div className="space-y-1.5">
        {children}
        {description ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </div>
  )
}

export function AddWorkspacePage() {
  const navigate = useNavigate()
  const { data: settings } = useSettings()
  const createWorkspace = useCreateWorkspace()

  const [name, setName] = useState("burns-web-app")
  const [sourceType, setSourceType] = useState<WorkspaceSourceMode>("create")
  const [sourceValue, setSourceValue] = useState("")
  const [targetFolder, setTargetFolder] = useState("burns-web-app")
  const [selectedWorkflowTemplateIds, setSelectedWorkflowTemplateIds] = useState(
    workflowTemplateOptions.map((option) => option.value)
  )

  async function handleCreateWorkspace() {
    const payload: CreateWorkspaceInput = sourceType === "clone"
      ? {
          name,
          sourceType,
          repoUrl: sourceValue,
          targetFolder,
          workflowTemplateIds: selectedWorkflowTemplateIds,
        }
      : {
          name,
          sourceType,
          targetFolder,
          workflowTemplateIds: selectedWorkflowTemplateIds,
        }

    const workspace = await createWorkspace.mutateAsync(payload)
    navigate(`/w/${workspace.id}/overview`)
  }

  const isCreateDisabled =
    createWorkspace.isPending ||
    !name.trim() ||
    (sourceType === "clone" && (!sourceValue.trim() || !targetFolder.trim())) ||
    (sourceType === "create" && !targetFolder.trim())

  return (
    <div className="flex flex-col p-6">
      <div className="mx-auto w-full max-w-4xl rounded-xl border bg-card">
        <div className="border-b px-6 py-5">
          <h1 className="text-xl font-semibold tracking-tight">Create workspace</h1>
          <p className="text-sm text-muted-foreground">
            Set a title, pick a source, choose the folder, and confirm.
          </p>
        </div>

        <div className="px-6">
          <FormRow
            label="Title"
            htmlFor="workspace-name"
            description="Displayed in the workspace list."
          >
            <Input
              id="workspace-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Workspace title"
            />
          </FormRow>

          <FormRow label="Source" description="Start from a new repo or clone from URL.">
            <Select
              value={sourceType}
              onValueChange={(value) => setSourceType(value as WorkspaceSourceMode)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose source mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="create">Create new repo</SelectItem>
                  <SelectItem value="clone">Clone repository</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </FormRow>

          {sourceType === "clone" ? (
            <FormRow
              label="Repository URL"
              htmlFor="workspace-repo-url"
              description="HTTPS or SSH Git URL."
            >
              <Input
                id="workspace-repo-url"
                value={sourceValue}
                onChange={(event) => setSourceValue(event.target.value)}
                placeholder="https://github.com/acme/burns-web-app.git"
              />
            </FormRow>
          ) : null}

          <FormRow
            label="Target folder"
            htmlFor="workspace-target-folder"
            description={`Workspace root: ${settings?.workspaceRoot ?? "Loading..."}`}
          >
            <NativeFolderPickerField
              id="workspace-target-folder"
              value={targetFolder}
              onChange={setTargetFolder}
              placeholder="burns-web-app"
              pickerLabel="Choose"
            />
          </FormRow>

          <FormRow
            label="Workflows"
            description="Select templates to pre-seed in .mr-burns/workflows."
          >
            <Combobox11
              className="max-w-full"
              label=""
              placeholder="Select workflow templates"
              searchPlaceholder="Search workflow template..."
              emptyLabel="No workflow template found."
              options={workflowTemplateOptions}
              selectedValues={selectedWorkflowTemplateIds}
              onChange={setSelectedWorkflowTemplateIds}
            />
          </FormRow>

          {createWorkspace.error ? (
            <div className="py-4">
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {createWorkspace.error.message}
              </div>
            </div>
          ) : null}

          <div className="flex justify-end py-5">
            <Button onClick={() => void handleCreateWorkspace()} disabled={isCreateDisabled}>
              {createWorkspace.isPending ? "Confirming..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
