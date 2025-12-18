import { find } from "lodash/fp"
import { Component } from "../../schemas/src/Component"

type LegCalculationContext = {
  height: number
  numberOfLayouts: number
  numberOfShelfUnits: number
}

export function calculateLegDemand(
  { height, numberOfLayouts, numberOfShelfUnits }: LegCalculationContext,
  catalog: Component[],
) {
  const availableLeg = find({ category: "leg", height }, catalog)

  if (!availableLeg) {
    throw new Error(`No leg found for height ${height}cm`)
  }

  return [
    {
      id: availableLeg.id,
      quantity: (numberOfShelfUnits + 1) * numberOfLayouts,
    },
  ]
}
