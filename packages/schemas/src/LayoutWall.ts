import * as v from "valibot"

import { ShelfUnitSchema } from "./ShelfUnit.js"

export const LayoutWallSchema = v.object({
  depth: v.number(),
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(ShelfUnitSchema),
})

export type LayoutWall = v.InferOutput<typeof LayoutWallSchema>
