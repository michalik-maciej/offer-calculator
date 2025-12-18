import { filter, orderBy } from "lodash/fp"
import { Component } from "../../schemas/src/Component"

type BackPanelCalculationContext = {
  height: number
  shelfUnitsByWidth: {
    quantity: number
    width: number
  }[]
}

export function calculateBackPanelDemand(
  { height, shelfUnitsByWidth }: BackPanelCalculationContext,
  catalog: Component[],
) {
  const BACK_CLEARANCE_CM = 10
  const demand = []

  for (const { width, quantity: unitQuantity } of shelfUnitsByWidth) {
    const availableBackPanels = orderBy(
      ["height"],
      ["desc"],
      filter({ category: "back", width }, catalog),
    )

    let remainder = height - BACK_CLEARANCE_CM

    for (const backPanel of availableBackPanels) {
      if (!backPanel.height || remainder < backPanel.height) continue

      const countPerShelfUnit = Math.floor(remainder / backPanel.height)
      if (countPerShelfUnit === 0) continue

      demand.push({
        ...backPanel,
        quantity: unitQuantity * countPerShelfUnit,
      })

      remainder %= backPanel.height
    }
  }

  return demand
}
