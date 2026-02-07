import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from "@domain/models/component"

import type { InventoryItem } from "../api/inventory.api"

function uniqueNumbers(values: Array<number | null | undefined>) {
  return Array.from(new Set(values.filter((v): v is number => v != null))).sort(
    (a, b) => a - b,
  )
}

interface Params {
  dimension: "width" | "height" | "depth"
  inventoryItems: InventoryItem[]
}

export function getDimensionOptions({ dimension, inventoryItems }: Params) {
  const optionsByCategory: Record<ComponentCategory, number[]> = {
    back: [],
    baseCover: [],
    foot: [],
    leg: [],
    misc: [],
    shelf: [],
    support: [],
  }

  for (const category of COMPONENT_CATEGORIES) {
    const itemsForCategory = inventoryItems.filter(
      (item) => item.category === category,
    )

    optionsByCategory[category] = uniqueNumbers(
      itemsForCategory.map((c) => c[dimension]),
    )
  }

  return optionsByCategory
}
