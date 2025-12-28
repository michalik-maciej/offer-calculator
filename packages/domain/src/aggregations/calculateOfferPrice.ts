import { find, reduce } from "lodash/fp"

import { Component } from "@/schemas/Component"

interface OfferPriceParams {
  bom: {
    id: string
    quantity: number
  }[]
  discountPercentage?: number
  catalog: Component[]
}

export const calculateOfferPrice = ({
  bom,
  discountPercentage = 0,
  catalog,
}: OfferPriceParams) => {
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
  const discountPrice =
    Math.round(basePrice * (1 - discountPercentage / 100) * 100) / 100

  return {
    basePrice,
    discountPrice,
  }
}
