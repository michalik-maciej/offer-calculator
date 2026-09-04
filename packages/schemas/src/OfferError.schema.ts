import * as v from "valibot"

export const MissingComponentSchema = v.object({
  category: v.optional(v.string()),
  depth: v.optional(v.number()),
  height: v.optional(v.number()),
  id: v.optional(v.string()),
  width: v.optional(v.number()),
})

export const OfferErrorSchema = v.object({
  error: v.string(),
  missingComponent: v.optional(MissingComponentSchema),
})

export type MissingComponent = v.InferOutput<typeof MissingComponentSchema>
export type OfferError = v.InferOutput<typeof OfferErrorSchema>
