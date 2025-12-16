import type { Collection } from "../../schemas/src/collection.js"
import type { Component } from "../../schemas/src/component.js"

import { aggregateComponentDemand } from "../aggregations/aggregateComponentDemand.js"
import {
  calculateShelfUnitDemand,
  type ComponentDemand,
} from "../shelf-unit/calculateShelfUnitDemand.js"

export interface CalculateShelfDemandInput {
  collections: Collection[]
  catalog: Component[]
}

export type ShelfDemandResult = ComponentDemand[]

/**
 * Calculates shelf + support component demand for the given collections.
 */
export function calculateShelfDemand(
  input: CalculateShelfDemandInput
): ShelfDemandResult {
  const lines: ComponentDemand[] = []

  for (const collection of input.collections) {
    for (const shelfUnit of collection.shelfUnits) {
      lines.push(
        ...calculateShelfUnitDemand({
          shelfUnit,
          catalog: input.catalog,
          collectionQuantity: collection.quantity,
        })
      )
    }
  }

  return aggregateComponentDemand(lines)
}
