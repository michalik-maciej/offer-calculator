import { find, map } from "lodash/fp"

import { Component } from "../../models/component"
import { MissingComponentError } from "../../models/missingComponentError"
import { ShelfUnit } from "../../models/shelfUnit"

type BaseCoverCalculationContext = {
  shelfUnitsByWidth: ShelfUnit[]
}

export function calculateBaseCoverDemand(
  { shelfUnitsByWidth }: BaseCoverCalculationContext,
  inventory: Component[],
) {
  return map(({ numberOfShelfUnits, width }) => {
    const availableBaseCover = find({ category: "baseCover", width }, inventory)

    if (!availableBaseCover) {
      throw new MissingComponentError(
        `No base cover found for width ${width}cm`,
        { category: "baseCover", width },
      )
    }

    return {
      id: availableBaseCover.id,
      quantity: numberOfShelfUnits,
    }
  }, shelfUnitsByWidth)
}
