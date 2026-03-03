import { useMutation } from "@tanstack/react-query"

import { OfferInput } from "@/schemas/Offer.schema"

import { offerApi } from "../offer.api"

export function usePreviewOffer() {
  return useMutation({
    mutationFn: (data: OfferInput) => offerApi.preview({ data }),
  })
}
