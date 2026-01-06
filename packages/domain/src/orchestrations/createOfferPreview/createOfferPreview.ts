import { groupDemandByCategory } from "@/domain/helpers/groupDemandByCategory/groupDemandByCategory"
import { mapLayoutsToOfferOutput } from "@/domain/helpers/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput"
import { calculateOfferDemand } from "@/domain/orchestrations/calculateOfferDemand/calculateOfferDemand"
import { Component } from "@/domain/types"
import { OfferInput, OfferOutput } from "@/schemas/Offer"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"

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
    demandBreakdown: groupDemandByCategory(bom, catalog),
    layouts: mapLayoutsToOfferOutput(layouts, catalog),
    title,
  }
}
