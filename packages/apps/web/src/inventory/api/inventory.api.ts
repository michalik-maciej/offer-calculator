import * as v from "valibot"

import { createApiMethod } from "@/shared/createMethod.api"

const InventoryItemSchema = v.object({
  id: v.string(), // uuid
  category: v.string(),
  width: v.nullable(v.number()),
  depth: v.nullable(v.number()),
  height: v.nullable(v.number()),
  price: v.number(),
  label: v.string(),
})

const InventoryItemListSchema = v.array(InventoryItemSchema)

const apiUrl = import.meta.env.VITE_APP_API_URL
if (!apiUrl) {
  throw new Error("Missing VITE_API_URL (set it in packages/apps/web/.env)")
}

const basePath = `${apiUrl}/inventory/items`

export const inventoryApi = {
  list: createApiMethod({
    method: "GET",
    path: basePath,
    response: InventoryItemListSchema,
  }),

  create: createApiMethod({
    method: "POST",
    path: basePath,
    response: InventoryItemSchema,
  }),

  update: (id: string) =>
    createApiMethod({
      method: "PUT",
      path: `${basePath}/${id}`,
      response: InventoryItemSchema,
    }),

  delete: (id: string) =>
    createApiMethod({
      method: "DELETE",
      path: `${basePath}/${id}`,
    }),
}

export const inventoryQueries = {
  list: () => ({
    queryKey: ["inventory", "list"] as const,
    queryFn: () => inventoryApi.list(),
  }),
}
