import * as v from "valibot"

export const LayoutWallValue = v.object({
  depth: v.number(),
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  shelfUnits: v.array(
    v.object({
      numberOfShelfUnits: v.pipe(v.number(), v.minValue(0)),
      shelves: v.array(
        v.object({
          depth: v.number(),
          numberOfShelves: v.pipe(v.number(), v.minValue(0)),
        }),
      ),
      width: v.number(),
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

export type LayoutWall = v.InferOutput<typeof LayoutWallValue>

export const isLayoutWall = (layout: unknown): layout is LayoutWall =>
  v.safeParse(LayoutWallValue, layout).success
