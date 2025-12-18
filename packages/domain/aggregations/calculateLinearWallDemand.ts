import { LinearWallLayout } from "../../schemas/src/LinearWallLayout"
import { Component } from "../../schemas/src/Component"

import { aggregateComponentDemand } from "../aggregations/aggregateComponentDemand"
import { calculateBackPanelDemand } from "../calculations/calculateBackPanelDemand"
import { calculateBaseShelfDemand } from "../calculations/calculateBaseShelfDemand"
import { calculateShelfDemand } from "../calculations/calculateShelfDemand"
import { calculateFootDemand } from "../calculations/calculateFootDemand"
import { calculateLegDemand } from "../calculations/calculateLegDemand"
import { countShelfUnitsByWidth } from "../helpers/countShelfUnitsByWidth"

export function calculateLinearWallDemand(
  { depth, height, shelfUnits, numberOfLayouts }: LinearWallLayout,
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

  const rawDemand = [
    ...calculateBackPanelDemand(backPanelContext, catalog),
    ...calculateBaseShelfDemand(baseShelfContext, catalog),
    ...calculateShelfDemand(shelfContext, catalog),
    ...calculateLegDemand(legContext, catalog),
    ...calculateFootDemand(footContext, catalog),
  ]

  return aggregateComponentDemand(rawDemand)
}
