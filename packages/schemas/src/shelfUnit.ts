import * as v from "valibot"

import { ShelfValue } from "./Shelf"

export const ShelfUnitValue = v.object({
  numberOfShelfUnits: v.pipe(v.number(), v.minValue(0)),
  shelves: v.array(ShelfValue),
  width: v.number(),
})

export type ShelfUnit = v.InferOutput<typeof ShelfUnitValue>
