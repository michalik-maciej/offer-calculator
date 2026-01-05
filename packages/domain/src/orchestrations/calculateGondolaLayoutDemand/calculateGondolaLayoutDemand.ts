import { LayoutGondola } from "@/schemas/LayoutGondola"

import { Component } from "../../types"
import { calculateWallLayoutDemand } from "../calculateWallLayoutDemand/calculateWallLayoutDemand"

export function calculateGondolaLayoutDemand(
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
      return calculateWallLayoutDemand(context, catalog)
    }),
    ...extras,
  ]
}
