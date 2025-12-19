import * as v from "valibot"
import { ShelfUnitSchema } from "../ShelfUnit.js"

export const LinearWallLayoutSchema = v.object({
  depth: v.number(),
  height: v.number(),
  id: v.pipe(v.string(), v.uuid()),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(ShelfUnitSchema),
})

export type LinearWallLayout = v.InferOutput<typeof LinearWallLayoutSchema>
