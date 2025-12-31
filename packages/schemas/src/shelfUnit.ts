import * as v from "valibot"

import { ShelfSchema } from "./Shelf.js"

export const ShelfUnitSchema = v.object({
  numberOfShelfUnits: v.pipe(v.number(), v.minValue(0)),
  shelves: v.array(ShelfSchema),
  width: v.number(),
})

export type ShelfUnit = v.InferOutput<typeof ShelfUnitSchema>
