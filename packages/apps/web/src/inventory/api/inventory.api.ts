import * as v from "valibot"

import { createApiMethod, type as apiType } from "@/core/createMethod.api"

const InventoryItemBaseShape = {
  category: v.string(),
  width: v.nullable(v.number()),
  depth: v.nullable(v.number()),
  height: v.nullable(v.number()),
  price: v.number(),
  label: v.string(),
} as const

const InventoryItemCreateSchema = v.object(InventoryItemBaseShape)
const _InventoryItemUpdateSchema = v.partial(InventoryItemCreateSchema)

const InventoryItemSchema = v.object({
  id: v.string(), // uuid
  ...InventoryItemBaseShape,
})

export type InventoryItem = v.InferOutput<typeof InventoryItemSchema>
export type InventoryItemCreateInput = v.InferOutput<
  typeof InventoryItemCreateSchema
>
export type InventoryItemUpdateInput = v.InferOutput<
  typeof _InventoryItemUpdateSchema
>

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
    data: apiType<InventoryItemCreateInput>(),
  }),

  update: createApiMethod({
    method: "PUT",
    path: `${basePath}/:id`,
    response: InventoryItemSchema,
    data: apiType<InventoryItemUpdateInput>(),
  }),

  delete: createApiMethod({
    method: "DELETE",
    path: `${basePath}/:id`,
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
