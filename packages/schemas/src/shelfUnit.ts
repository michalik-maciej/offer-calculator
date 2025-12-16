import * as v from "valibot"

import { ShelfSchema } from "./shelf.js"

export const ShelfUnitSchema = v.object({
  id: v.pipe(v.string(), v.uuid()),
  quantity: v.pipe(v.number(), v.minValue(0)),
  shelves: v.array(ShelfSchema),
  width: v.union([v.number(), v.null()]),
})

export type ShelfUnit = v.InferOutput<typeof ShelfUnitSchema>
