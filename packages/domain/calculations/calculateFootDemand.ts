import { find } from "lodash/fp"
import { Component } from "../../schemas/src/Component"

type FootCalculationContext = {
  depth: number
  numberOfShelfUnits: number
}

export function calculateFootDemand(
  { depth, numberOfShelfUnits }: FootCalculationContext,
  catalog: Component[],
) {
  const availableFoot = find({ category: "foot", depth }, catalog)

  if (!availableFoot) {
    throw new Error(`No foot found for depth ${depth}cm`)
  }

  return [
    {
      ...availableFoot,
      quantity: numberOfShelfUnits + 1,
    },
  ]
}
