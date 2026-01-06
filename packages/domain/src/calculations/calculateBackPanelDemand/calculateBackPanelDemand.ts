import { filter, orderBy } from "lodash/fp"

import { Component } from "../../models/component"
import { ShelfUnit } from "../../models/shelfUnit"

type BackPanelCalculationContext = {
  height: number
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateBackPanelDemand(
  { height, shelfUnitsByWidth }: BackPanelCalculationContext,
  catalog: Component[],
) {
  const BACK_CLEARANCE_CM = 10
  const demand = []

  for (const { width, numberOfShelfUnits } of shelfUnitsByWidth) {
    const availableBackPanels = orderBy(
      ["height"],
      ["desc"],
      filter({ category: "back", width }, catalog),
    )

    if (availableBackPanels.length === 0) {
      throw new Error(`No back panels found for width ${width}cm`)
    }

    let remainder = height - BACK_CLEARANCE_CM

    for (const { id, height: panelHeight } of availableBackPanels) {
      if (!panelHeight || remainder < panelHeight) continue

      const countPerShelfUnit = Math.floor(remainder / panelHeight)
      if (countPerShelfUnit === 0) continue

      demand.push({
        id,
        quantity: numberOfShelfUnits * countPerShelfUnit,
      })

      remainder %= panelHeight
    }
  }

  return demand
}
