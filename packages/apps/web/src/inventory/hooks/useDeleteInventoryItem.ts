import { useMutation, useQueryClient } from "@tanstack/react-query"

import { inventoryApi, inventoryQueries } from "../api/inventory.api"

export function useDeleteInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => inventoryApi.delete(id)(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inventoryQueries.list().queryKey,
      })
    },
  })
}
