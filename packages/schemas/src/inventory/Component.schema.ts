import * as v from "valibot"

export const ComponentCategorySchema = v.picklist([
  "back",
  "baseCover",
  "foot",
  "leg",
  "misc",
  "shelf",
  "support",
])

export const ComponentBaseSchema = v.object({
  category: ComponentCategorySchema,
  depth: v.nullable(v.number()),
  height: v.nullable(v.number()),
  width: v.nullable(v.number()),
  label: v.string(),
  price: v.number(),
})
