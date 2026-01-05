import * as v from "valibot"

import { ShelfUnitValue } from "./ShelfUnit"

export const LayoutWallValue = v.object({
  depth: v.number(),
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(ShelfUnitValue),
  extras: v.optional(
    v.array(
      v.object({
        id: v.string(),
        quantity: v.number(),
      }),
    ),
  ),
})

export type LayoutWall = v.InferOutput<typeof LayoutWallValue>

export const isLayoutWall = (layout: unknown): layout is LayoutWall =>
  v.safeParse(LayoutWallValue, layout).success
