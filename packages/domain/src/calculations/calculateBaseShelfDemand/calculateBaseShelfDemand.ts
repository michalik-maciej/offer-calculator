import { find, map } from "lodash/fp"
import { ShelfUnit } from "@domain/models/shelfUnit"

import { Component } from "../../models/component"

type BaseShelfCalculationContext = {
  depth: number
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateBaseShelfDemand(
  { depth, shelfUnitsByWidth }: BaseShelfCalculationContext,
  inventory: Component[],
) {
  return map(({ numberOfShelfUnits, width }) => {
    const availableShelf = find({ category: "shelf", depth, width }, inventory)

    if (!availableShelf) {
      throw new Error(`No base shelf found for depth ${depth}cm`)
    }

    return {
      id: availableShelf.id,
      quantity: numberOfShelfUnits,
    }
  }, shelfUnitsByWidth)
}
