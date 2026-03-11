import type { EditWorkflowInput } from "@mr-burns/shared"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { burnsClient } from "@/lib/api/client"

export function useEditWorkflow(workspaceId?: string, workflowId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: EditWorkflowInput) =>
      burnsClient.editWorkflow(workspaceId!, workflowId!, input),
    onSuccess: async (workflow) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] }),
        queryClient.invalidateQueries({ queryKey: ["workflow", workspaceId, workflow.id] }),
      ])
    },
  })
}
