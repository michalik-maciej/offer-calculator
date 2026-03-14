import * as v from "valibot"

import type { ComponentCategory } from "@/domain/models/component"

import { apiType, createApiMethod } from "../core/createMethod.api"

const InventoryItemBaseShape = {
  category: v.custom<ComponentCategory>(
    (val) => typeof val === "string",
    "Invalid category",
  ),
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

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error("Missing VITE_API_URL")
}

export const inventoryApi = {
  list: createApiMethod({
    method: "GET",
    path: `${apiUrl}/inventory/items`,
    response: InventoryItemListSchema,
  }),

  create: createApiMethod({
    method: "POST",
    path: `${apiUrl}/inventory/items`,
    response: InventoryItemSchema,
    data: apiType<InventoryItemCreateInput>(),
  }),

  update: createApiMethod({
    method: "PUT",
    path: `${`${apiUrl}/inventory/items`}/:id`,
    response: InventoryItemSchema,
    data: apiType<InventoryItemUpdateInput>(),
  }),

  delete: createApiMethod({
    method: "DELETE",
    path: `${`${apiUrl}/inventory/items`}/:id`,
  }),
}

export const inventoryQueries = {
  list: () => ({
    queryKey: ["inventory", "list"] as const,
    queryFn: () => inventoryApi.list(),
  }),
}
