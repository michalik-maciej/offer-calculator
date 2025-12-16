import type { Component } from "../../schemas/src/component.js"
import type { ShelfUnit } from "../../schemas/src/shelfUnit.js"

export interface ComponentDemand {
  component: Component
  quantity: number
}

export class MissingCatalogComponentError extends Error {
  override name = "MissingCatalogComponentError"

  constructor(message: string) {
    super(message)
  }
}

export interface CalculateShelfUnitDemandInput {
  shelfUnit: ShelfUnit
  catalog: Component[]
  /** Multiplies all demand for this shelf unit (typically `collection.quantity`). */
  collectionQuantity: number
}

function requireFiniteNonNegative(
  value: number,
  label: string
): asserts value is number {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a finite number >= 0`)
  }
}

function findShelfComponent(
  catalog: Component[],
  width: number,
  depth: number | null
): Component | undefined {
  return catalog.find(
    (item) =>
      item.category === "shelf" && item.width === width && item.depth === depth
  )
}

function findSupportComponent(
  catalog: Component[],
  depth: number | null
): Component | undefined {
  return catalog.find(
    (item) => item.category === "support" && item.depth === depth
  )
}

/**
 * Calculates demand for a single shelf unit.
 *
 * Business rules (current):
 * - For each shelf instance: 1 shelf component and 2 support components.
 * - Shelf component match: `category=shelf` AND `width` AND `depth`.
 * - Support component match: `category=support` AND `depth`.
 */
export function calculateShelfUnitDemand(
  input: CalculateShelfUnitDemandInput
): ComponentDemand[] {
  requireFiniteNonNegative(input.collectionQuantity, "collectionQuantity")
  requireFiniteNonNegative(input.shelfUnit.quantity, "shelfUnit.quantity")

  const width = input.shelfUnit.width
  if (width === null) {
    throw new MissingCatalogComponentError(
      `ShelfUnit ${input.shelfUnit.id} has width=null; cannot match shelf components.`
    )
  }

  const unitInstances = input.collectionQuantity * input.shelfUnit.quantity
  const lines: ComponentDemand[] = []

  for (const shelf of input.shelfUnit.shelves) {
    requireFiniteNonNegative(shelf.quantity, "shelf.quantity")

    const shelfInstances = unitInstances * shelf.quantity
    if (shelfInstances === 0) continue

    const shelfComponent = findShelfComponent(input.catalog, width, shelf.depth)
    if (!shelfComponent) {
      throw new MissingCatalogComponentError(
        `Missing shelf component in catalog (category=shelf, width=${width}, depth=${String(
          shelf.depth
        )}).`
      )
    }

    const supportComponent = findSupportComponent(input.catalog, shelf.depth)
    if (!supportComponent) {
      throw new MissingCatalogComponentError(
        `Missing support component in catalog (category=support, depth=${String(
          shelf.depth
        )}).`
      )
    }

    lines.push({ component: shelfComponent, quantity: shelfInstances })
    lines.push({ component: supportComponent, quantity: 2 * shelfInstances })
  }

  return lines
}
