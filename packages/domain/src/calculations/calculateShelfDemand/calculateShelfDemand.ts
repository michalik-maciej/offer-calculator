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

  for (const { numberOfShelfUnits, width, shelves } of shelfUnits) {
    const unitInstances = numberOfShelfUnits * numberOfLayouts

    for (const { numberOfShelves, depth } of shelves) {
      const shelfInstances = numberOfShelves * unitInstances
      if (shelfInstances === 0) continue

      const availableShelf = find(
        { category: "shelf", depth: depth, width: width },
        catalog,
      )

      if (!availableShelf) {
        throw new Error(
          `No shelf found for width ${width}cm and depth ${depth}cm`,
        )
      }

      const availableSupport = find(
        { category: "support", depth: depth },
        catalog,
      )

      if (!availableSupport) {
        throw new Error(`No support found for depth ${depth}cm`)
      }

      addToDemand(availableShelf, shelfInstances)
      addToDemand(availableSupport, shelfInstances * SUPPORTS_PER_SHELF)
    }
  }

  return demand
}
