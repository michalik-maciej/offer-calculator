import * as v from "valibot"

export const ShelfSchema = v.object({
  depth: v.number(),
  id: v.pipe(v.string(), v.uuid()),
  quantity: v.pipe(v.number(), v.minValue(0)),
})

export type Shelf = v.InferOutput<typeof ShelfSchema>
