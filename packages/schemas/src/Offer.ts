import * as v from "valibot"

import { LayoutGondolaSchema } from "./LayoutGondola"
import { LayoutWallSchema } from "./LayoutWall"

export const OfferInputSchema = v.object({
  discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  layouts: v.array(v.union([LayoutGondolaSchema, LayoutWallSchema])),
  title: v.string(),
})

export type OfferInput = v.InferOutput<typeof OfferInputSchema>

export const OfferOutputSchema = v.object({
  basePrice: v.pipe(v.number(), v.minValue(0)),
  discountPrice: v.pipe(v.number(), v.minValue(0)),
  demandBreakdown: v.record(
    v.picklist([
      "back",
      "baseCover",
      "foot",
      "leg",
      "misc",
      "shelf",
      "support",
    ]),
    v.array(
      v.object({
        componentId: v.string(),
        quantity: v.pipe(v.number(), v.minValue(0)),
      }),
    ),
  ),
  layouts: v.array(
    v.object({
      description: v.string(),
      basePrice: v.pipe(v.number(), v.minValue(0)),
    }),
  ),
  title: v.string(),
})

export type OfferOutput = v.InferOutput<typeof OfferOutputSchema>
