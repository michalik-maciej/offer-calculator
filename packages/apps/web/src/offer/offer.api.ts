import * as v from "valibot"

import {
  OfferInput,
  OfferOutput,
  OfferOutputSchema,
} from "@/schemas/Offer.schema"

import { apiType, createApiMethod } from "../core/createMethod.api"

const OfferListSchema = v.array(OfferOutputSchema)

const apiUrl = import.meta.env.VITE_API_URL
if (!apiUrl) {
  throw new Error("Missing VITE_API_URL")
}

export const offerApi = {
  list: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers`,
    response: OfferListSchema,
  }),
  details: createApiMethod({
    method: "GET",
    path: `${apiUrl}/offers/:id`,
    response: OfferOutputSchema,
  }),
  create: createApiMethod({
    method: "POST",
    path: `${apiUrl}/offers`,
    response: OfferOutputSchema,
    data: apiType<OfferInput>(),
  }),
  update: createApiMethod({
    method: "PUT",
    path: `${apiUrl}/offers/:id`,
    response: OfferOutputSchema,
    data: apiType<OfferInput>(),
  }),
  delete: createApiMethod({
    method: "DELETE",
    path: `${apiUrl}/offers/:id`,
    response: v.null(),
    data: apiType<{ id: string }>(),
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
  details: (id: string) => ({
    queryKey: ["offer", "details", id] as const,
    queryFn: () => offerApi.details({ params: { id } }),
  }),
  preview: (draft: OfferInput | null) => ({
    queryKey: ["offer", "preview", draft] as const,
    queryFn: () => offerApi.preview({ data: draft! }),
    enabled: !!draft?.layouts.length,
    placeholderData: (previous: OfferOutput | undefined) => previous,
  }),
}
