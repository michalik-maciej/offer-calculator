import { Component } from "@/schemas/Component"
import { LayoutGondola } from "@/schemas/LayoutGondola"

import { aggregateWallDemand } from "../aggregateWallDemand/aggregateWallDemand"

export function aggregateGondolaDemand(
  { height, gondolaUnits, numberOfLayouts }: LayoutGondola,
  catalog: Component[],
) {
  return gondolaUnits.flatMap(({ depth, numberOfGondolaUnits, shelfUnits }) =>
    aggregateWallDemand(
      {
        depth,
        height,
        numberOfLayouts: numberOfLayouts * numberOfGondolaUnits,
        shelfUnits,
      },
      catalog,
    ),
  )
}
