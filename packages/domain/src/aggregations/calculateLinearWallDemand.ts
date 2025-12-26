import { Component } from "@/schemas/Component"
import { LinearWallLayout } from "@/schemas/layouts/LinearWallLayout"

import { aggregateComponentDemand } from "./aggregateComponentDemand"
import { calculateBackPanelDemand } from "../calculations/calculateBackPanelDemand"
import { calculateBaseShelfDemand } from "../calculations/calculateBaseShelfDemand"
import { calculateFootDemand } from "../calculations/calculateFootDemand"
import { calculateLegDemand } from "../calculations/calculateLegDemand"
import { calculateShelfDemand } from "../calculations/calculateShelfDemand"
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
