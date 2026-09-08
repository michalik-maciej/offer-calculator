import { compact } from "lodash/fp"

import { GONDOLA_SIDES, LayoutGondola } from "@/schemas/LayoutGondola.schema"

import { Component } from "../../models/component"
import { calculateWallLayoutDemand } from "../calculateWallLayoutDemand/calculateWallLayoutDemand"

const END_CAP_RUN_COUNT = 1

export function calculateGondolaLayoutDemand(
  {
    backVariant,
    extras = [],
    gondolaUnits,
    hasBaseCover,
    height,
    leftEndCap,
    numberOfLayouts,
    rightEndCap,
  }: LayoutGondola,
  inventory: Component[],
) {
  return [
    ...gondolaUnits.flatMap(({ depth, shelfUnits }) => {
      const context = {
        backVariant,
        depth,
        hasBaseCover,
        height,
        numberOfLayouts: numberOfLayouts * GONDOLA_SIDES,
        numberOfLegLayouts: numberOfLayouts,
        shelfUnits,
      }
      return calculateWallLayoutDemand(context, inventory)
    }),
    ...compact([leftEndCap, rightEndCap]).flatMap((endCap) =>
      calculateWallLayoutDemand(
        { ...endCap, height, numberOfLayouts: END_CAP_RUN_COUNT },
        inventory,
      ),
    ),
    ...extras,
  ]
}
