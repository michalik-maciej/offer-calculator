import { find } from "lodash/fp"
import { Component } from "../../schemas/src/Component"

type LegCalculationContext = {
  height: number
  numberOfShelfUnits: number
}

export function calculateLegDemand(
  { height, numberOfShelfUnits }: LegCalculationContext,
  catalog: Component[],
) {
  const availableLeg = find({ category: "leg", height }, catalog)

  if (!availableLeg) {
    throw new Error(`No leg found for height ${height}cm`)
  }

  return [
    {
      ...availableLeg,
      quantity: numberOfShelfUnits + 1,
    },
  ]
}
