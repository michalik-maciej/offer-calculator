import * as v from "valibot"

import { ShelfUnitSchema } from "./ShelfUnit.js"

export const LayoutLinearWallSchema = v.object({
  depth: v.number(),
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(ShelfUnitSchema),
})

export type LayoutLinearWall = v.InferOutput<typeof LayoutLinearWallSchema>

export function parseLayoutLinearWall(dto: unknown) {
  // TODO throw if invalid
  return v.parse(LayoutLinearWallSchema, dto)
}
