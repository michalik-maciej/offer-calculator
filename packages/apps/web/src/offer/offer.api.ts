import * as v from "valibot"

import { OfferInput, OfferOutputSchema } from "@/schemas/Offer.schema"

import { apiType, createApiMethod } from "../core/createMethod.api"

const OfferListSchema = v.array(OfferOutputSchema)

const apiUrl = import.meta.env.VITE_APP_API_URL_LOCAL
if (!apiUrl) {
  throw new Error("Missing VITE_API_URL (set it in packages/apps/web/.env)")
}

export const offerApi = {
  list: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers`,
    response: OfferListSchema,
  }),

  preview: createApiMethod({
    method: "POST",
    path: `${apiUrl}/offers/preview`,
    response: OfferOutputSchema,
    data: apiType<OfferInput>(),
  }),
}

export const offerQueries = {
  list: () => ({
    queryKey: ["offer", "list"] as const,
    queryFn: () => offerApi.list(),
  }),
}
