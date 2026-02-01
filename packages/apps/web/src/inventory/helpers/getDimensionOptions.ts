import type { InventoryItem } from "../api/inventory.api"

function uniqueNumbers(values: Array<number | null | undefined>) {
  return Array.from(new Set(values.filter((v): v is number => v != null))).sort(
    (a, b) => a - b,
  )
}

interface Params {
  dimension: "width" | "height" | "depth"
  inventoryItems: InventoryItem[]
  category?: string
}

export function getDimensionOptions({
  dimension,
  inventoryItems,
  category,
}: Params) {
  const filtered = category
    ? inventoryItems.filter((item) => item.category === category)
    : inventoryItems

  return uniqueNumbers(filtered.map((c) => c[dimension]))
}
