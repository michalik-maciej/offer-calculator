import { isLayoutGondola } from "@/schemas/LayoutGondola.schema"
import { isLayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { Component, ComponentDemand } from "../../models/component"
import { calculateGondolaLayoutDemand } from "../../orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand"
import { calculateWallLayoutDemand } from "../../orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand"
import { breakdownDemandByCategory } from "../../transformations/breakdownDemandByCategory/breakdownDemandByCategory"
import { buildLayoutDescription } from "../buildLayoutDescription/buildLayoutDescription"

export const mapLayoutsToOfferOutput = (
  layouts: OfferInput["layouts"],
  catalog: Component[],
): OfferOutput["layouts"] =>
  layouts.map((layout) => {
    let bom: ComponentDemand = []

    switch (true) {
      case isLayoutWall(layout):
        bom = calculateWallLayoutDemand(layout, catalog)
        break
      case isLayoutGondola(layout):
        bom = calculateGondolaLayoutDemand(layout, catalog)
    }
    const { basePrice } = calculateBomPrice({ bom }, catalog)
    const description = buildLayoutDescription(layout)
    const breakdown = breakdownDemandByCategory(bom, catalog)

    return { basePrice, description, breakdown }
  })
