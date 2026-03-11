import { CheckIcon, WandSparklesIcon } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
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
import { useAgentClis } from "@/features/agents/hooks/use-agent-clis"
import { useActiveWorkspace } from "@/features/workspaces/hooks/use-active-workspace"
import { useGenerateWorkflow } from "@/features/workflows/hooks/use-generate-workflow"

export function NewWorkflowPage() {
  const navigate = useNavigate()
  const { workspace } = useActiveWorkspace()
  const { data: agentClis = [], isLoading: isAgentListLoading } = useAgentClis()
  const generateWorkflow = useGenerateWorkflow(workspace?.id)

  const [name, setName] = useState("issue-to-pr")
  const [prompt, setPrompt] = useState(
    "Create a workflow that takes an issue description, proposes a plan, implements the change, validates it, and summarizes the result."
  )
  const [selectedAgentId, setSelectedAgentId] = useState<string>("")
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false)

  useEffect(() => {
    if (!selectedAgentId && agentClis[0]) {
      setSelectedAgentId(agentClis[0].id)
    }
  }, [selectedAgentId, agentClis])

  const selectedAgent = useMemo(
    () => agentClis.find((agent) => agent.id === selectedAgentId) ?? null,
    [agentClis, selectedAgentId]
  )

  const generatedWorkflow = generateWorkflow.data ?? null
  const generatedWorkflowFolder = generatedWorkflow
    ? `.mr-burns/workflows/${generatedWorkflow.id}`
    : null

  const defaultExpanded = useMemo(
    () =>
      generatedWorkflow
        ? new Set([".mr-burns", ".mr-burns/workflows", generatedWorkflowFolder!])
        : new Set<string>(),
    [generatedWorkflow, generatedWorkflowFolder]
  )

  const submitStatus = generateWorkflow.isPending ? "submitted" : "ready"

  function handleAgentSubmit(message: PromptInputMessage) {
    if (!workspace || !selectedAgentId) {
      return
    }

    const submittedPrompt = message.text?.trim() || prompt.trim()
    if (!submittedPrompt) {
      return
    }

    setPrompt(submittedPrompt)
    generateWorkflow.mutate({
      name,
      agentId: selectedAgentId,
      prompt: submittedPrompt,
    })
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="New workflow"
        description={`Generate a workflow for ${workspace?.name ?? "the selected workspace"} using an installed agent CLI.`}
        actions={
          <Button variant="outline" onClick={() => navigate(`/workflows`)}>
            Back to workflows
          </Button>
        }
      />
      <div className="grid gap-4 p-6 xl:grid-cols-[28rem_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Workflow generator</CardTitle>
            <CardDescription>
              Build a new workflow by prompting an installed Smithers-compatible CLI agent.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="workflow-name">Workflow name</FieldLabel>
                <Input
                  id="workflow-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
                <FieldDescription>
                  This becomes the workflow folder under <code>.mr-burns/workflows</code>.
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
                  Uses the Smithers-style normalized CLI adapter for generation.
                </FieldDescription>
              </Field>

              <Field>
                <FieldLabel>Workflow prompt</FieldLabel>
                <PromptInput onSubmit={handleAgentSubmit}>
                  <PromptInputBody>
                    <PromptInputTextarea
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Describe the workflow you want to generate"
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
                            <PromptInputButton className="max-w-full justify-start overflow-hidden" size="sm" />
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
                      disabled={!name.trim() || !prompt.trim() || !selectedAgentId || isAgentListLoading}
                      status={submitStatus}
                    />
                  </PromptInputFooter>
                </PromptInput>
                <FieldDescription>
                  On submit, Mr. Burns injects workflow-generation instructions before your prompt,
                  asks the selected CLI to write <code>workflow.tsx</code> into the workspace, then reads the file back and previews it here.
                </FieldDescription>
              </Field>

              {generateWorkflow.error ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {generateWorkflow.error.message}
                </div>
              ) : null}
            </FieldGroup>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Generated workflow</CardTitle>
              <CardDescription>
                Review the generated file tree and source before opening the editor.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 xl:grid-cols-[18rem_1fr]">
              <div className="flex flex-col gap-3">
                <FileTree
                  defaultExpanded={defaultExpanded}
                  selectedPath={generatedWorkflow?.relativePath}
                >
                  <FileTreeFolder name=".mr-burns" path=".mr-burns">
                    <FileTreeFolder name="workflows" path=".mr-burns/workflows">
                      {generatedWorkflow && generatedWorkflowFolder ? (
                        <FileTreeFolder name={generatedWorkflow.id} path={generatedWorkflowFolder}>
                          <FileTreeFile
                            name="workflow.tsx"
                            path={generatedWorkflow.relativePath}
                          />
                        </FileTreeFolder>
                      ) : null}
                    </FileTreeFolder>
                  </FileTreeFolder>
                </FileTree>
                {generatedWorkflow ? (
                  <Button
                    onClick={() =>
                      navigate(
                        `/workflows/${generatedWorkflow.id}`
                      )
                    }
                  >
                    Open in editor
                  </Button>
                ) : null}
              </div>

              {generatedWorkflow ? (
                <CodeBlock
                  className="max-h-[36rem]"
                  code={generatedWorkflow.source}
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
                  Submit a workflow prompt to generate and preview a new workflow.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
