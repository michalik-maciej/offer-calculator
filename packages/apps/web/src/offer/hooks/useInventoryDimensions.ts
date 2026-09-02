import { useQuery } from "@tanstack/react-query"

import {
  SHELF_CONSTRAINTS,
  SHELF_UNIT_CONSTRAINTS,
  WALL_LAYOUT_CONSTRAINTS,
} from "@/domain/models/layoutConstraints"

import { getDimensionOptions } from "../../inventory/helpers/getDimensionOptions"
import { inventoryQueries } from "../../inventory/inventory.api"

export type InventoryDimensions = {
  layoutHeights: number[]
  layoutDepths: number[]
  shelfUnitWidths: number[]
  shelfDepths: number[]
}

export function useInventoryDimensions(): InventoryDimensions {
  const { data: items = [] } = useQuery(inventoryQueries.list())

  const heights = getDimensionOptions({
    dimension: "height",
    inventoryItems: items,
  })
  const depths = getDimensionOptions({
    dimension: "depth",
    inventoryItems: items,
  })
  const widths = getDimensionOptions({
    dimension: "width",
    inventoryItems: items,
  })

  return {
    layoutHeights: heights[WALL_LAYOUT_CONSTRAINTS.height],
    layoutDepths: depths[WALL_LAYOUT_CONSTRAINTS.depth],
    shelfUnitWidths: widths[SHELF_UNIT_CONSTRAINTS.width],
    shelfDepths: depths[SHELF_CONSTRAINTS.depth],
  }
}
