import { createFileRoute } from "@tanstack/react-router"

import { OfferRoute } from "../offer/offer"

export const Route = createFileRoute("/offer")({
  component: OfferRoute,
})
