import { LayoutGondola } from "@/schemas/LayoutGondola.schema"

import { createDefaultWallLayout } from "./createDefaultWallLayout"
import { InventoryDimensions } from "../hooks/useInventoryDimensions"

const GONDOLA_SIDES = 2

export function createDefaultGondolaLayout(
  dimensions: InventoryDimensions,
): LayoutGondola | null {
  const wallLayout = createDefaultWallLayout(dimensions)

  if (!wallLayout) return null

  return {
    extras: [],
    gondolaUnits: [
      {
        depth: wallLayout.depth,
        numberOfGondolaUnits: GONDOLA_SIDES,
        shelfUnits: wallLayout.shelfUnits,
      },
    ],
    height: wallLayout.height,
    numberOfLayouts: wallLayout.numberOfLayouts,
  }
}
