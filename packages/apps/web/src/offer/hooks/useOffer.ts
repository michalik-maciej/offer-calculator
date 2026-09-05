import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"

import { offerQueries } from "../offer.api"

export function useOffer() {
  const { offerId } = useSearch({ strict: false })

  const { data: offer, isFetching } = useQuery({
    ...offerQueries.details(offerId ?? ""),
    enabled: !!offerId,
  })

  return { isFetching, offer, offerId }
}
