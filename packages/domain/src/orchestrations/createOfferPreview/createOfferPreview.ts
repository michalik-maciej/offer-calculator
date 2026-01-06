import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component } from "../../models/component"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { mapLayoutsToOfferOutput } from "../../transformations/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput"
import { calculateOfferDemand } from "../calculateOfferDemand/calculateOfferDemand"

export function createOfferPreview(
  { discountPercentage, layouts, title }: OfferInput,
  catalog: Component[],
): OfferOutput {
  const bom = calculateOfferDemand(layouts, catalog)
  const { basePrice, discountPrice } = calculateBomPrice(
    { bom, discountPercentage },
    catalog,
  )

  return {
    basePrice,
    discountPrice,
    breakdown: breakdownDemandByCategory(bom, catalog),
    layouts: mapLayoutsToOfferOutput(layouts, catalog),
    title,
  }
}
