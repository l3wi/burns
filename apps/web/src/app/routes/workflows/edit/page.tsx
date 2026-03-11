import { CheckIcon, WandSparklesIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"

import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ai-elements/code-block"
import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/ai-elements/file-tree"
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector"
import {
  PromptInput,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
} from "@/components/ai-elements/prompt-input"
import { PageHeader } from "@/components/app-shell/page-header"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAgentClis } from "@/features/agents/hooks/use-agent-clis"
import { useEditWorkflow } from "@/features/workflows/hooks/use-edit-workflow"
import { useWorkflow } from "@/features/workflows/hooks/use-workflow"
import { useWorkflows } from "@/features/workflows/hooks/use-workflows"
import { useActiveWorkspace } from "@/features/workspaces/hooks/use-active-workspace"

export function EditWorkflowPage() {
  const navigate = useNavigate()
  const { workflowId } = useParams()
  const { workspace } = useActiveWorkspace()
  const { data: agentClis = [], isLoading: isAgentListLoading } = useAgentClis()
  const { data: workflows = [], isLoading: isWorkflowListLoading } = useWorkflows(workspace?.id)
  const { data: workflowDocument, isLoading: isWorkflowLoading } = useWorkflow(
    workspace?.id,
    workflowId
  )
  const editWorkflow = useEditWorkflow(workspace?.id, workflowId)

  const [prompt, setPrompt] = useState(
    "Update this workflow to add an approval gate before deploy and preserve stable task IDs."
  )
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)

  useEffect(() => {
    if (!selectedAgentId && agentClis[0]) {
      setSelectedAgentId(agentClis[0].id)
    }
  }, [selectedAgentId, agentClis])

  useEffect(() => {
    if (!workflowId || isWorkflowListLoading) {
      return
    }

    if (workflows.every((workflow) => workflow.id !== workflowId)) {
      navigate("/workflows", { replace: true })
    }
  }, [isWorkflowListLoading, navigate, workflowId, workflows])

  const selectedAgent = useMemo(
    () => agentClis.find((agent) => agent.id === selectedAgentId) ?? null,
    [agentClis, selectedAgentId]
  )

  const previewWorkflow = editWorkflow.data ?? workflowDocument ?? null
  const previewWorkflowFolder = previewWorkflow
    ? `.mr-burns/workflows/${previewWorkflow.id}`
    : null

  const defaultExpanded = useMemo(
    () =>
      previewWorkflow && previewWorkflowFolder
        ? new Set([".mr-burns", ".mr-burns/workflows", previewWorkflowFolder])
        : new Set<string>(),
    [previewWorkflow, previewWorkflowFolder]
  )

  const submitStatus = editWorkflow.isPending ? "submitted" : "ready"

  function handleAgentSubmit(message: PromptInputMessage) {
    if (!workspace || !workflowId || !selectedAgentId) {
      return
    }

    const submittedPrompt = message.text?.trim() || prompt.trim()
    if (!submittedPrompt) {
      return
    }

    setPrompt(submittedPrompt)
    editWorkflow.mutate({
      agentId: selectedAgentId,
      prompt: submittedPrompt,
    })
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Edit workflow"
        description={`Prompt an installed agent CLI to read and overwrite ${workflowId ?? "the selected workflow"} in ${workspace?.name ?? "the selected workspace"}.`}
        actions={
          <Button
            variant="outline"
            onClick={() => navigate(workflowId ? `/workflows/${workflowId}` : "/workflows")}
          >
            Back to workflow
          </Button>
        }
      />
      <div className="grid gap-4 p-6 xl:grid-cols-[28rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workflow editor agent</CardTitle>
            <CardDescription>
              Ask an installed Smithers-compatible CLI agent to read the current workflow file
              and overwrite it with your requested changes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="workflow-name">Workflow name</FieldLabel>
                <Input
                  id="workflow-name"
                  value={workflowDocument?.name ?? workflowId ?? ""}
                  readOnly
                  disabled
                />
                <FieldDescription>
                  This edits the existing workflow under <code>{workflowDocument?.relativePath ?? ".mr-burns/workflows/.../workflow.tsx"}</code>.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="workflow-agent">Agent CLI</FieldLabel>
                <Select
                  value={selectedAgentId}
                  onValueChange={(value) => setSelectedAgentId(value ?? "")}
                >
                  <SelectTrigger id="workflow-agent" className="w-full">
                    <SelectValue placeholder="Select an installed agent CLI" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {agentClis.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldDescription>
                  Uses the Smithers-style normalized CLI adapter for workflow edits.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Edit prompt</FieldLabel>
                <PromptInput onSubmit={handleAgentSubmit}>
                  <PromptInputBody>
                    <PromptInputTextarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Describe how the current workflow should change"
                    />
                  </PromptInputBody>
                  <PromptInputFooter>
                    <PromptInputTools className="min-w-0 flex-1">
                      <ModelSelector
                        open={isModelSelectorOpen}
                        onOpenChange={setIsModelSelectorOpen}
                      >
                        <ModelSelectorTrigger
                          render={
                            <PromptInputButton
                              className="max-w-full justify-start overflow-hidden"
                              size="sm"
                            />
                          }
                        >
                          {selectedAgent ? (
                            <>
                              <ModelSelectorLogo provider={selectedAgent.logoProvider} />
                              <ModelSelectorName className="truncate">
                                {selectedAgent.name}
                              </ModelSelectorName>
                            </>
                          ) : (
                            <ModelSelectorName>Select agent</ModelSelectorName>
                          )}
                        </ModelSelectorTrigger>
                        <ModelSelectorContent title="Installed agent CLIs">
                          <ModelSelectorInput placeholder="Search installed agent CLIs..." />
                          <ModelSelectorList>
                            <ModelSelectorEmpty>No installed agent CLIs found.</ModelSelectorEmpty>
                            <ModelSelectorGroup heading="Installed agent CLIs">
                              {agentClis.map((agent) => (
                                <ModelSelectorItem
                                  key={agent.id}
                                  value={agent.id}
                                  onSelect={() => {
                                    setSelectedAgentId(agent.id)
                                    setIsModelSelectorOpen(false)
                                  }}
                                >
                                  <ModelSelectorLogo provider={agent.logoProvider} />
                                  <ModelSelectorName>{agent.name}</ModelSelectorName>
                                  {selectedAgentId === agent.id ? (
                                    <CheckIcon className="ml-auto" data-icon="inline-end" />
                                  ) : null}
                                </ModelSelectorItem>
                              ))}
                            </ModelSelectorGroup>
                          </ModelSelectorList>
                        </ModelSelectorContent>
                      </ModelSelector>
                    </PromptInputTools>
                    <PromptInputSubmit
                      disabled={
                        !workflowId ||
                        !prompt.trim() ||
                        !selectedAgentId ||
                        isAgentListLoading ||
                        isWorkflowLoading
                      }
                      status={submitStatus}
                    />
                  </PromptInputFooter>
                </PromptInput>
                <FieldDescription>
                  On submit, Mr. Burns tells the selected CLI to read the current <code>workflow.tsx</code>, apply your requested changes, overwrite that same file, then reads it back and previews the updated source here.
                </FieldDescription>
              </Field>

              {editWorkflow.error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {editWorkflow.error.message}
                </div>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Updated workflow</CardTitle>
              <CardDescription>
                Review the current or updated file tree and source before returning to the main editor.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[18rem_1fr]">
              <div className="flex flex-col gap-3">
                <FileTree
                  defaultExpanded={defaultExpanded}
                  selectedPath={previewWorkflow?.relativePath}
                >
                  <FileTreeFolder name=".mr-burns" path=".mr-burns">
                    <FileTreeFolder name="workflows" path=".mr-burns/workflows">
                      {previewWorkflow && previewWorkflowFolder ? (
                        <FileTreeFolder name={previewWorkflow.id} path={previewWorkflowFolder}>
                          <FileTreeFile
                            name="workflow.tsx"
                            path={previewWorkflow.relativePath}
                          />
                        </FileTreeFolder>
                      ) : null}
                    </FileTreeFolder>
                  </FileTreeFolder>
                </FileTree>
                {previewWorkflow ? (
                  <Button onClick={() => navigate(`/workflows/${previewWorkflow.id}`)}>
                    Open in editor
                  </Button>
                ) : null}
              </div>

              {previewWorkflow ? (
                <CodeBlock
                  className="max-h-[36rem]"
                  code={previewWorkflow.source}
                  language="tsx"
                  showLineNumbers
                >
                  <CodeBlockHeader>
                    <CodeBlockTitle>
                      <WandSparklesIcon data-icon="inline-start" />
                      <CodeBlockFilename>workflow.tsx</CodeBlockFilename>
                    </CodeBlockTitle>
                    <CodeBlockActions>
                      <CodeBlockCopyButton />
                    </CodeBlockActions>
                  </CodeBlockHeader>
                </CodeBlock>
              ) : (
                <div className="flex min-h-[28rem] items-center justify-center rounded-xl border px-6 text-sm text-muted-foreground">
                  Load a workflow, then submit an edit prompt to preview the updated file.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
