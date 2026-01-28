import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { InventoryItemUpdateInput } from "../api/inventory.api"
import { inventoryApi, inventoryQueries } from "../api/inventory.api"

type UpdateInput = {
  id: string
  data: Partial<InventoryItemUpdateInput>
}

export function useUpdateInventoryItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: UpdateInput) =>
      inventoryApi.update({ params: { id }, data }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: inventoryQueries.grouped().queryKey,
      })
    },
  })
}
