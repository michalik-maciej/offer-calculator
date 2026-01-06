import { find } from "lodash/fp"

import { Component } from "../../models/component"

type FootCalculationContext = {
  depth: number
  numberOfLayouts: number
  numberOfUnits: number
}

export function calculateFootDemand(
  { depth, numberOfLayouts, numberOfUnits }: FootCalculationContext,
  catalog: Component[],
) {
  const availableFoot = find({ category: "foot", depth }, catalog)

  if (!availableFoot) {
    throw new Error(`No foot found for depth ${depth}cm`)
  }

  return [
    {
      id: availableFoot.id,
      quantity: (numberOfUnits + 1) * numberOfLayouts,
    },
  ]
}
