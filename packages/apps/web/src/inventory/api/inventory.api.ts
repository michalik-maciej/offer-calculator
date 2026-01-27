import * as v from "valibot"

import { createApiMethod } from "@/core/createMethod.api"

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

const InventoryGroupedSchema = v.array(
  v.object({
    category: v.string(),
    items: InventoryItemListSchema,
  }),
)

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

  grouped: createApiMethod({
    method: "GET",
    path: `${basePath}/grouped`,
    response: InventoryGroupedSchema,
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
  grouped: () => ({
    queryKey: ["inventory", "list", "grouped"] as const,
    queryFn: () => inventoryApi.grouped(),
  }),
}
