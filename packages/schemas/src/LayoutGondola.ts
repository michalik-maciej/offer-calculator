import * as v from "valibot"

import { ShelfUnitValue } from "./ShelfUnit"

export const LayoutGondolaValue = v.object({
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  gondolaUnits: v.array(
    v.object({
      depth: v.number(),
      numberOfGondolaUnits: v.pipe(v.number(), v.minValue(0)),
      shelfUnits: v.array(ShelfUnitValue),
    }),
  ),
  extras: v.optional(
    v.array(
      v.object({
        id: v.string(),
        quantity: v.number(),
      }),
    ),
  ),
})

export type LayoutGondola = v.InferOutput<typeof LayoutGondolaValue>

export const isLayoutGondola = (layout: unknown): layout is LayoutGondola =>
  v.safeParse(LayoutGondolaValue, layout).success
