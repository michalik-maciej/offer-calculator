import * as v from "valibot"

import { LayoutLinearWallSchema } from "./LayoutLinearWall"

export const OfferSchema = v.object({
  discountPercentage: v.pipe(v.number(), v.minValue(0), v.maxValue(100)),
  id: v.pipe(v.string(), v.uuid()),
  layouts: v.array(LayoutLinearWallSchema),
  title: v.string(),
})

export type Offer = v.InferOutput<typeof OfferSchema>
