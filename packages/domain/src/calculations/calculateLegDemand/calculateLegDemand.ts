import { find } from "lodash/fp"

import { Component } from "@/schemas/Component"

type LegCalculationContext = {
  height: number
  numberOfLayouts: number
  numberOfUnits: number
}

export function calculateLegDemand(
  { height, numberOfLayouts, numberOfUnits }: LegCalculationContext,
  catalog: Component[],
) {
  const availableLeg = find({ category: "leg", height }, catalog)

  if (!availableLeg) {
    throw new Error(`No leg found for height ${height}cm`)
  }

  return [
    {
      id: availableLeg.id,
      quantity: (numberOfUnits + 1) * numberOfLayouts,
    },
  ]
}
