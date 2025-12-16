import * as v from "valibot"
import { ShelfUnitSchema } from "./shelfUnit.js"

export const CollectionSchema = v.object({
  depth: v.union([v.number(), v.null()]),
  height: v.union([v.number(), v.null()]),
  id: v.pipe(v.string(), v.uuid()),
  quantity: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(ShelfUnitSchema),
})

export type Collection = v.InferOutput<typeof CollectionSchema>
