import { LayoutWall } from "@/schemas/LayoutWall.schema"

import { calculateBackPanelDemand } from "../../calculations/calculateBackPanelDemand/calculateBackPanelDemand"
import { calculateBaseShelfDemand } from "../../calculations/calculateBaseShelfDemand/calculateBaseShelfDemand"
import { calculateFootDemand } from "../../calculations/calculateFootDemand/calculateFootDemand"
import { calculateLegDemand } from "../../calculations/calculateLegDemand/calculateLegDemand"
import { calculateShelfDemand } from "../../calculations/calculateShelfDemand/calculateShelfDemand"
import { Component } from "../../models/component"
import { countShelfUnitsByWidth } from "../../transformations/countShelfUnitsByWidth/countShelfUnitsByWidth"

export function calculateWallLayoutDemand(
  { depth, height, shelfUnits, numberOfLayouts, extras = [] }: LayoutWall,
  inventory: Component[],
) {
  const shelfUnitsByWidth = countShelfUnitsByWidth(shelfUnits, numberOfLayouts)
  const numberOfUnits = shelfUnits.reduce(
    (sum, { numberOfShelfUnits }) => sum + numberOfShelfUnits,
    0,
  )

  const backPanelContext = {
    height,
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
    numberOfLayouts,
    numberOfUnits,
  }

  const footContext = {
    depth,
    numberOfLayouts,
    numberOfUnits,
  }

  return [
    ...calculateBackPanelDemand(backPanelContext, inventory),
    ...calculateBaseShelfDemand(baseShelfContext, inventory),
    ...calculateShelfDemand(shelfContext, inventory),
    ...calculateLegDemand(legContext, inventory),
    ...calculateFootDemand(footContext, inventory),
    ...extras,
  ]
}
