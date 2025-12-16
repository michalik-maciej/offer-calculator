import * as v from "valibot"

export const ComponentSchema = v.object({
  category: v.picklist([
    "back",
    "baseCover",
    "foot",
    "leg",
    "misc",
    "shelf",
    "support",
  ]),
  depth: v.nullable(v.number()),
  height: v.nullable(v.number()),
  id: v.string(),
  label: v.string(),
  price: v.number(),
  width: v.nullable(v.number()),
})

export type Component = v.InferOutput<typeof ComponentSchema>
