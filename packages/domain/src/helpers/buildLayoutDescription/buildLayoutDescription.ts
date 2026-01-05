import { isLayoutGondola } from "@/schemas/LayoutGondola"
import { isLayoutWall } from "@/schemas/LayoutWall"

export function buildLayoutDescription(layout: unknown) {
  if (isLayoutWall(layout)) {
    const parts: string[] = []

    parts.push(`${layout.numberOfLayouts} x ciąg regałów przyściennych`)

    for (const { numberOfShelfUnits, width } of layout.shelfUnits) {
      parts.push(`${numberOfShelfUnits}x${width}`)
    }

    parts.push(`baza ${layout.depth}`)
    parts.push(`h-${layout.height}`)

    const firstShelf = layout.shelfUnits.find((unit) => unit.shelves.length > 0)
      ?.shelves[0]
    if (firstShelf) {
      parts.push(`półki ${firstShelf.numberOfShelves}x${firstShelf.depth}`)
    }

    return parts.join(" / ")
  }

  if (isLayoutGondola(layout)) {
    const parts: string[] = []

    parts.push(`${layout.numberOfLayouts} x ciąg regałów dwustronnych`)

    const firstGondolaUnit = layout.gondolaUnits[0]
    if (firstGondolaUnit) {
      const { depth, shelfUnits } = firstGondolaUnit

      for (const { numberOfShelfUnits, width } of shelfUnits) {
        parts.push(`${numberOfShelfUnits}x${width}`)
      }

      parts.push(`baza ${depth}`)
    }

    parts.push(`h-${layout.height}`)

    const firstShelf = firstGondolaUnit.shelfUnits.find(
      (unit) => unit.shelves.length > 0,
    )?.shelves[0]
    if (firstShelf) {
      parts.push(`półki ${firstShelf.numberOfShelves}x${firstShelf.depth}`)
    }

    return parts.join(" / ")
  }

  return "opis niedostępny"
}
