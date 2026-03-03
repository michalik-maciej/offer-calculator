import { createFileRoute } from "@tanstack/react-router"

import { OfferPage } from "../../offer/components/OfferPage"

export const Route = createFileRoute("/offer/$offerId")({
  component: OfferPage,
})
