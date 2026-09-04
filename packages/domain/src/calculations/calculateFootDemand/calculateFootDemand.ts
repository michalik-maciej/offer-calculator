import { find } from "lodash/fp"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

type FootCalculationContext = {
  depth: number
  numberOfLayouts: number
  numberOfUnits: number
}

export function calculateFootDemand(
  { depth, numberOfLayouts, numberOfUnits }: FootCalculationContext,
  inventory: Component[],
) {
  const availableFoot = find({ category: "foot", depth }, inventory)

  if (!availableFoot) {
    throw new MissingComponentError(`No foot found for depth ${depth}cm`, {
      category: "foot",
      depth,
    })
  }

  return [
    {
      id: availableFoot.id,
      quantity: (numberOfUnits + 1) * numberOfLayouts,
    },
  ]
}
