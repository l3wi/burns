import type { GenerateWorkflowInput } from "@mr-burns/shared"

import { useMutation, useQueryClient } from "@tanstack/react-query"

import { burnsClient } from "@/lib/api/client"

export function useGenerateWorkflow(workspaceId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: GenerateWorkflowInput) =>
      burnsClient.generateWorkflow(workspaceId!, input),
    onSuccess: async (workflow) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] }),
        queryClient.invalidateQueries({ queryKey: ["workflow", workspaceId, workflow.id] }),
      ])
    },
  })
}
