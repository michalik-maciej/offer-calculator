import * as v from "valibot"

import { ShelfUnitSchema } from "./ShelfUnit.js"

export const LayoutWallSchema = v.object({
  depth: v.number(),
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(ShelfUnitSchema),
  extras: v.optional(
    v.array(
      v.object({
        id: v.string(),
        quantity: v.number(),
      }),
    ),
  ),
})

export type LayoutWall = v.InferOutput<typeof LayoutWallSchema>

export const isLayoutWall = (layout: unknown): layout is LayoutWall =>
  v.safeParse(LayoutWallSchema, layout).success
