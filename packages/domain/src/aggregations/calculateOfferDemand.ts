import { aggregateComponentDemand } from "@/domain/aggregations/aggregateComponentDemand"
import { Component } from "@/schemas/Component"
import { OfferInput } from "@/schemas/Offer"

import { calculateLinearWallDemand } from "./calculateLinearWallDemand"

export const calculateOfferDemand = (
  layouts: OfferInput["layouts"],
  catalog: Component[],
) => {
  return aggregateComponentDemand(
    layouts.flatMap((layout) => calculateLinearWallDemand(layout, catalog)),
  )
}
