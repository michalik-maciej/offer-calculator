import { Component } from "@/schemas/Component"
import { isLayoutGondola } from "@/schemas/LayoutGondola"
import { isLayoutWall } from "@/schemas/LayoutWall"
import { OfferInput, OfferOutput } from "@/schemas/Offer"

import { aggregateGondolaLayoutDemand } from "../../aggregations/aggregateGondolaLayoutDemand/aggregateGondolaLayoutDemand"
import { aggregateWallLayoutDemand } from "../../aggregations/aggregateWallLayoutDemand/aggregateWallLayoutDemand"
import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { buildLayoutDescription } from "../buildLayoutDescription/buildLayoutDescription"

export const mapLayoutsToOfferOutput = (
  layouts: OfferInput["layouts"],
  catalog: Component[],
): OfferOutput["layouts"] =>
  layouts.map((layout) => {
    let bom: { id: string; quantity: number }[] = []
    switch (true) {
      case isLayoutWall(layout):
        bom = aggregateWallLayoutDemand(layout, catalog)
        break
      case isLayoutGondola(layout):
        bom = aggregateGondolaLayoutDemand(layout, catalog)
    }
    const { basePrice } = calculateBomPrice({ bom, catalog })
    const description = buildLayoutDescription(layout)

    return { basePrice, description }
  })
