import { LayoutWall } from "@/schemas/LayoutWall.schema"

import { calculateBackPanelDemand } from "../../calculations/calculateBackPanelDemand/calculateBackPanelDemand"
import { calculateBaseCoverDemand } from "../../calculations/calculateBaseCoverDemand/calculateBaseCoverDemand"
import { calculateBaseShelfDemand } from "../../calculations/calculateBaseShelfDemand/calculateBaseShelfDemand"
import { calculateFootDemand } from "../../calculations/calculateFootDemand/calculateFootDemand"
import { calculateLegDemand } from "../../calculations/calculateLegDemand/calculateLegDemand"
import { calculateShelfDemand } from "../../calculations/calculateShelfDemand/calculateShelfDemand"
import { Component } from "../../models/component"
import { countShelfUnitsByWidth } from "../../transformations/countShelfUnitsByWidth/countShelfUnitsByWidth"

type WallLayoutCalculationContext = LayoutWall & {
  numberOfLegLayouts?: number
}

export function calculateWallLayoutDemand(
  {
    backVariant,
    depth,
    height,
    shelfUnits,
    numberOfLayouts,
    numberOfLegLayouts = numberOfLayouts,
    hasBaseCover = false,
    extras = [],
  }: WallLayoutCalculationContext,
  inventory: Component[],
) {
  const shelfUnitsByWidth = countShelfUnitsByWidth(shelfUnits, numberOfLayouts)
  const numberOfUnits = shelfUnits.reduce(
    (sum, { numberOfShelfUnits }) => sum + numberOfShelfUnits,
    0,
  )

  const backPanelContext = {
    backVariant,
    height,
    shelfUnitsByWidth,
  }

  const baseCoverContext = {
    shelfUnitsByWidth,
  }

  const baseShelfContext = {
    depth,
    shelfUnitsByWidth,
  }

  const shelfContext = {
    shelfUnits,
    numberOfLayouts,
  }

  const legContext = {
    height,
    numberOfLayouts: numberOfLegLayouts,
    numberOfUnits,
  }

  const footContext = {
    depth,
    numberOfLayouts,
    numberOfUnits,
  }

  return [
    ...calculateBackPanelDemand(backPanelContext, inventory),
    ...(hasBaseCover
      ? calculateBaseCoverDemand(baseCoverContext, inventory)
      : []),
    ...calculateBaseShelfDemand(baseShelfContext, inventory),
    ...calculateShelfDemand(shelfContext, inventory),
    ...calculateLegDemand(legContext, inventory),
    ...calculateFootDemand(footContext, inventory),
    ...extras,
  ]
}
