import { find, map } from "lodash/fp"

import { ShelfUnit } from "@/domain/models/shelfUnit"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"

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
      throw new MissingComponentError(
        `No base shelf found for depth ${depth}cm`,
        { category: "shelf", depth, width },
      )
    }

    return {
      id: availableShelf.id,
      quantity: numberOfShelfUnits,
    }
  }, shelfUnitsByWidth)
}
