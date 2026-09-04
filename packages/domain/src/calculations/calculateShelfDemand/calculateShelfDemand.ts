import { find } from "lodash/fp"

import { Component, ComponentDemand } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"
import { ShelfUnit } from "../../models/shelfUnit"

type ShelfCalculationContext = {
  numberOfLayouts: number
  shelfUnits: ShelfUnit[]
}

export function calculateShelfDemand(
  { numberOfLayouts, shelfUnits }: ShelfCalculationContext,
  inventory: Component[],
) {
  const SUPPORTS_PER_SHELF = 2
  const demand: ComponentDemand = []

  const addToDemand = ({ id }: Component, quantity: number) => {
    const existing = find({ id }, demand)
    if (existing) {
      existing.quantity += quantity
      return
    }

    demand.push({ id, quantity })
  }

  for (const { numberOfShelfUnits, width, shelves = [] } of shelfUnits) {
    const unitInstances = numberOfShelfUnits * numberOfLayouts

    for (const { numberOfShelves, depth } of shelves) {
      const shelfInstances = numberOfShelves * unitInstances
      if (shelfInstances === 0) continue

      const availableShelf = find(
        { category: "shelf", depth: depth, width: width },
        inventory,
      )

      if (!availableShelf) {
        throw new MissingComponentError(
          `No shelf found for width ${width}cm and depth ${depth}cm`,
          { category: "shelf", depth, width },
        )
      }

      const availableSupport = find(
        { category: "support", depth: depth },
        inventory,
      )

      if (!availableSupport) {
        throw new MissingComponentError(
          `No support found for depth ${depth}cm`,
          { category: "support", depth },
        )
      }

      addToDemand(availableShelf, shelfInstances)
      addToDemand(availableSupport, shelfInstances * SUPPORTS_PER_SHELF)
    }
  }

  return demand
}
