import * as v from "valibot"

export const LayoutGondolaValue = v.object({
  height: v.number(),
  numberOfLayouts: v.pipe(v.number(), v.minValue(0)),
  gondolaUnits: v.array(
    v.object({
      depth: v.number(),
      numberOfGondolaUnits: v.pipe(v.number(), v.minValue(0)),
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
