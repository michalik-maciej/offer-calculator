import { LinearWallLayout } from "../../schemas/src/layouts/LinearWallLayout"

export function countShelfUnitsByWidth(
  shelfUnits: LinearWallLayout["shelfUnits"],
  numberOfLayouts: number,
): {
  quantity: number
  width: number
}[] {
  const map = new Map<number, number>()

  for (const unit of shelfUnits) {
    const current = map.get(unit.width) ?? 0
    map.set(unit.width, current + unit.quantity * numberOfLayouts)
  }

  return Array.from(map.entries()).map(([width, quantity]) => ({
    quantity,
    width,
  }))
}
