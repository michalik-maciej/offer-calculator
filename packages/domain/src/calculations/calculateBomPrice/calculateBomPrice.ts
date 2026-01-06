import { find, reduce } from "lodash/fp"

import { Component, ComponentDemand } from "../../models/component"

type BomPriceCalculationContext = {
  bom: ComponentDemand
  discountPercentage?: number
}

export const calculateBomPrice = (
  { bom, discountPercentage = 0 }: BomPriceCalculationContext,
  catalog: Component[],
) => {
  const basePrice = reduce(
    (total, { id, quantity }) => {
      const component = find({ id }, catalog)
      if (!component) {
        throw new Error(`Component with id ${id} not found in catalog`)
      }

      return total + component.price * quantity
    },
    0,
    bom,
  )
  const discountPrice = basePrice * (1 - discountPercentage / 100)

  return {
    basePrice: Number(basePrice.toFixed(2)),
    discountPrice: Number(discountPrice.toFixed(2)),
  }
}
