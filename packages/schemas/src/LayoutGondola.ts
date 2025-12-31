import * as v from "valibot"

import { ShelfUnitSchema } from "./ShelfUnit.js"

export const LayoutGondolaSchema = v.object({
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  gondolaUnits: v.array(
    v.object({
      depth: v.number(),
      numberOfGondolaUnits: v.pipe(v.number(), v.minValue(0)),
      shelfUnits: v.array(ShelfUnitSchema),
    }),
  ),
})

export type LayoutGondola = v.InferOutput<typeof LayoutGondolaSchema>

export const isLayoutGondola = (layout: unknown): layout is LayoutGondola =>
  v.safeParse(LayoutGondolaSchema, layout).success
