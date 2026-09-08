import * as v from "valibot"

import { BACK_VARIANTS } from "./LayoutWall.schema"

const ShelfUnitValue = v.object({
  numberOfShelfUnits: v.pipe(v.number(), v.minValue(0)),
  shelves: v.array(
    v.object({
      depth: v.number(),
      numberOfShelves: v.pipe(v.number(), v.minValue(0)),
    }),
  ),
  width: v.number(),
})

export const GondolaEndCapValue = v.object({
  backVariant: v.optional(v.picklist(BACK_VARIANTS)),
  depth: v.number(),
  hasBaseCover: v.optional(v.boolean()),
  shelfUnits: v.array(ShelfUnitValue),
})

export type GondolaEndCap = v.InferOutput<typeof GondolaEndCapValue>

export const GONDOLA_SIDES = 2

export const LayoutGondolaValue = v.object({
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  gondolaUnits: v.array(
    v.object({
      depth: v.number(),
      shelfUnits: v.array(ShelfUnitValue),
    }),
  ),
  backVariant: v.optional(v.picklist(BACK_VARIANTS)),
  hasBaseCover: v.optional(v.boolean()),
  leftEndCap: v.optional(GondolaEndCapValue),
  rightEndCap: v.optional(GondolaEndCapValue),
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
