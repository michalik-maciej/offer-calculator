import { find, map } from "lodash/fp"
import { Component } from "../../schemas/src/Component"

type BaseShelfCalculationContext = {
  depth: number
  shelfUnitsByWidth: {
    quantity: number
    width: number
  }[]
}

export function calculateBaseShelfDemand(
  { depth, shelfUnitsByWidth }: BaseShelfCalculationContext,
  catalog: Component[],
) {
  return map(({ quantity, width }) => {
    const availableShelf = find({ category: "shelf", depth, width }, catalog)

    if (!availableShelf) {
      throw new Error(`No base shelf found for depth ${depth}cm`)
    }

    return {
      id: availableShelf.id,
      quantity,
    }
  }, shelfUnitsByWidth)
}
