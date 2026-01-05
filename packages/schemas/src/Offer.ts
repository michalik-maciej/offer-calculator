import * as v from "valibot"

import { LayoutGondolaValue } from "./LayoutGondola"
import { LayoutWallValue } from "./LayoutWall"

export const OfferInputSchema = v.object({
  discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  layouts: v.array(v.union([LayoutGondolaValue, LayoutWallValue])),
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
        id: v.string(),
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
