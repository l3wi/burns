import { useMutation, useQueryClient } from "@tanstack/react-query"

import { burnsClient } from "@/lib/api/client"

export function useSaveWorkflow(workspaceId?: string, workflowId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ source }: { source: string }) =>
      burnsClient.saveWorkflow(workspaceId!, workflowId!, source),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["workflows", workspaceId] }),
        queryClient.invalidateQueries({ queryKey: ["workflow", workspaceId, workflowId] }),
      ])
    },
  })
}
