import * as v from "valibot"

export const ShelfValue = v.object({
  depth: v.number(),
  numberOfShelves: v.pipe(v.number(), v.minValue(0)),
})

export type Shelf = v.InferOutput<typeof ShelfValue>
