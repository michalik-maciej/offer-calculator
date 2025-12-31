import { Component } from "@/schemas/Component"
import { LayoutLinearWall } from "@/schemas/LayoutLinearWall"

import { calculateBackPanelDemand } from "../../calculations/calculateBackPanelDemand/calculateBackPanelDemand"
import { calculateBaseShelfDemand } from "../../calculations/calculateBaseShelfDemand/calculateBaseShelfDemand"
import { calculateFootDemand } from "../../calculations/calculateFootDemand/calculateFootDemand"
import { calculateLegDemand } from "../../calculations/calculateLegDemand/calculateLegDemand"
import { calculateShelfDemand } from "../../calculations/calculateShelfDemand/calculateShelfDemand"
import { countShelfUnitsByWidth } from "../../helpers/countShelfUnitsByWidth/countShelfUnitsByWidth"

export function aggregateLinearWallDemand(
  { depth, height, shelfUnits, numberOfLayouts }: LayoutLinearWall,
  catalog: Component[],
) {
  const shelfUnitsByWidth = countShelfUnitsByWidth(shelfUnits, numberOfLayouts)
  const numberOfShelfUnits = shelfUnits.reduce(
    (sum, unit) => sum + unit.quantity,
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
    numberOfShelfUnits,
  }

  const footContext = {
    depth,
    numberOfLayouts,
    numberOfShelfUnits,
  }

  return [
    ...calculateBackPanelDemand(backPanelContext, catalog),
    ...calculateBaseShelfDemand(baseShelfContext, catalog),
    ...calculateShelfDemand(shelfContext, catalog),
    ...calculateLegDemand(legContext, catalog),
    ...calculateFootDemand(footContext, catalog),
  ]
}
