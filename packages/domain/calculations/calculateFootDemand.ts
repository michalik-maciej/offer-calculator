import { find } from "lodash/fp"
import { Component } from "../../schemas/src/Component"

type FootCalculationContext = {
  depth: number
  numberOfLayouts: number
  numberOfShelfUnits: number
}

export function calculateFootDemand(
  { depth, numberOfLayouts, numberOfShelfUnits }: FootCalculationContext,
  catalog: Component[],
) {
  const availableFoot = find({ category: "foot", depth }, catalog)

  if (!availableFoot) {
    throw new Error(`No foot found for depth ${depth}cm`)
  }

  return [
    {
      id: availableFoot.id,
      quantity: (numberOfShelfUnits + 1) * numberOfLayouts,
    },
  ]
}
