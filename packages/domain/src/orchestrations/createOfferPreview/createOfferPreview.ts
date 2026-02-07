import type { OfferInput, OfferOutput } from "@schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component } from "../../models/component"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { mapLayoutsToOfferOutput } from "../../transformations/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput"
import { calculateOfferDemand } from "../calculateOfferDemand/calculateOfferDemand"

export function createOfferPreview(
  { discountPercentage, layouts, title }: OfferInput,
  inventory: Component[],
): OfferOutput {
  const bom = calculateOfferDemand(layouts, inventory)

  return {
    breakdown: breakdownDemandByCategory(bom, inventory),
    layouts: mapLayoutsToOfferOutput(layouts, inventory),
    pricing: {
      ...calculateBomPrice({ bom, discountPercentage }, inventory),
      discountPercentage,
    },
    title,
  }
}
