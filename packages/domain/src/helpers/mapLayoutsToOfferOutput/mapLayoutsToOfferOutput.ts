import { isLayoutGondola } from "@/schemas/LayoutGondola"
import { isLayoutWall } from "@/schemas/LayoutWall"
import { OfferInput, OfferOutput } from "@/schemas/Offer"

import { calculateBomPrice } from "../../calculations/calculateBomPrice/calculateBomPrice"
import { calculateGondolaLayoutDemand } from "../../orchestrations/calculateGondolaLayoutDemand/calculateGondolaLayoutDemand"
import { calculateWallLayoutDemand } from "../../orchestrations/calculateWallLayoutDemand/calculateWallLayoutDemand"
import { Component, ComponentDemand } from "../../types"
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

    return { basePrice, description }
  })
