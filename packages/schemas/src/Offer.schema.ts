import * as v from "valibot"

import { LayoutGondolaValue } from "./LayoutGondola.schema"
import { LayoutWallValue } from "./LayoutWall.schema"

export const OfferInputSchema = v.object({
  discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  layouts: v.array(v.union([LayoutGondolaValue, LayoutWallValue])),
  title: v.string(),
})

export type OfferInput = v.InferOutput<typeof OfferInputSchema>

export const OfferOutputSchema = v.object({
  breakdown: v.record(
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
        label: v.string(),
        quantity: v.pipe(v.number(), v.minValue(0)),
      }),
    ),
  ),
  layouts: v.array(
    v.object({
      breakdown: v.record(
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
            label: v.string(),
            quantity: v.pipe(v.number(), v.minValue(0)),
          }),
        ),
      ),
      description: v.string(),
      basePrice: v.pipe(v.number(), v.minValue(0)),
    }),
  ),
  pricing: v.object({
    basePrice: v.pipe(v.number(), v.minValue(0)),
    discountPrice: v.pipe(v.number(), v.minValue(0)),
    discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  }),
  title: v.string(),
})

export type OfferOutput = v.InferOutput<typeof OfferOutputSchema>
