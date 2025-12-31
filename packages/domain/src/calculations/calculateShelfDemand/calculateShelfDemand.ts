import { find } from "lodash/fp"

import { Component } from "@/schemas/Component"
import { ShelfUnit } from "@/schemas/ShelfUnit"

type ShelfCalculationContext = {
  numberOfLayouts: number
  shelfUnits: ShelfUnit[]
}

export function calculateShelfDemand(
  { numberOfLayouts, shelfUnits }: ShelfCalculationContext,
  catalog: Component[],
) {
  const SUPPORTS_PER_SHELF = 2
  const demand: { id: string; quantity: number }[] = []

  const addToDemand = ({ id }: Component, quantity: number) => {
    const existing = find({ id }, demand)
    if (existing) {
      existing.quantity += quantity
      return
    }

    demand.push({ id, quantity })
  }

  for (const shelfUnit of shelfUnits) {
    const unitInstances = shelfUnit.quantity * numberOfLayouts

    for (const shelf of shelfUnit.shelves) {
      const shelfInstances = shelf.quantity * unitInstances
      if (shelfInstances === 0) continue

      const availableShelf = find(
        { category: "shelf", depth: shelf.depth, width: shelfUnit.width },
        catalog,
      )

      if (!availableShelf) {
        throw new Error(
          `No shelf found for width ${shelfUnit.width}cm and depth ${shelf.depth}cm`,
        )
      }

      const availableSupport = find(
        { category: "support", depth: shelf.depth },
        catalog,
      )

      if (!availableSupport) {
        throw new Error(`No support found for depth ${shelf.depth}cm`)
      }

      addToDemand(availableShelf, shelfInstances)
      addToDemand(availableSupport, shelfInstances * SUPPORTS_PER_SHELF)
    }
  }

  return demand
}
