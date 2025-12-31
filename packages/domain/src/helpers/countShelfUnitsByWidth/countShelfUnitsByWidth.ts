import { LayoutWall } from "@/schemas/LayoutWall"

export function countShelfUnitsByWidth(
  shelfUnits: LayoutWall["shelfUnits"],
  numberOfLayouts: number,
): {
  quantity: number
  width: number
}[] {
  const map = new Map<number, number>()

  for (const { numberOfShelfUnits, width } of shelfUnits) {
    const current = map.get(width) ?? 0
    map.set(width, current + numberOfShelfUnits * numberOfLayouts)
  }

  return Array.from(map.entries()).map(([width, quantity]) => ({
    quantity,
    width,
  }))
}
