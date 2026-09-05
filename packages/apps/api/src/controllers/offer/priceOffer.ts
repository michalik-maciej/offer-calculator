import { Component } from "@/domain/models/component"
import { isMissingComponentError } from "@/domain/models/missingComponentError"
import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"
import { MissingComponent } from "@/schemas/OfferError.schema"

export type PricedOffer = {
  missingComponent?: MissingComponent
  output: OfferOutput | null
}

export function priceOffer(
  input: OfferInput,
  inventory: Component[],
): PricedOffer {
  try {
    return { output: createOfferPreview(input, inventory) }
  } catch (error) {
    if (isMissingComponentError(error)) {
      return { missingComponent: error.query, output: null }
    }

    throw error
  }
}
