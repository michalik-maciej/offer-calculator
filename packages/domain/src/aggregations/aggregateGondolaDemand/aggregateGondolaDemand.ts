import { Component } from "@/schemas/Component"
import { LayoutGondola } from "@/schemas/LayoutGondola"

import { aggregateWallDemand } from "../aggregateWallDemand/aggregateWallDemand"

export function aggregateGondolaDemand(
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
      return aggregateWallDemand(context, catalog)
    }),
    ...extras,
  ]
}
