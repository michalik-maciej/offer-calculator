import { Component } from "@/schemas/Component"
import { LayoutGondola } from "@/schemas/LayoutGondola"

import { aggregateWallLayoutDemand } from "../aggregateWallLayoutDemand/aggregateWallLayoutDemand"

export function aggregateGondolaLayoutDemand(
  { height, gondolaUnits, numberOfLayouts, extras = [] }: LayoutGondola,
  catalog: Component[],
) {
  return [
    ...gondolaUnits.flatMap(({ depth, numberOfGondolaUnits, shelfUnits }) => {
      const context = {
        depth,
        height,
        numberOfLayouts: numberOfLayouts * numberOfGondolaUnits,
        shelfUnits,
      }
      return aggregateWallLayoutDemand(context, catalog)
    }),
    ...extras,
  ]
}
