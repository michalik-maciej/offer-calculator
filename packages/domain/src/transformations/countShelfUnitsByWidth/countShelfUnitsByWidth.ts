import { ShelfUnit } from "../../models/shelfUnit"

export function countShelfUnitsByWidth(
  shelfUnits: ShelfUnit[],
  numberOfLayouts: number,
): ShelfUnit[] {
  const map = new Map<number, number>()

  for (const { numberOfShelfUnits, width } of shelfUnits) {
    const current = map.get(width) ?? 0
    map.set(width, current + numberOfShelfUnits * numberOfLayouts)
  }

  return Array.from(map.entries()).map(([width, numberOfShelfUnits]) => ({
    numberOfShelfUnits,
    width,
  }))
}
