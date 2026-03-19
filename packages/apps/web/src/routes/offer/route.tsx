import { OfferPage } from "packages/apps/web/src/offer/components/OfferPage"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/offer")({
  component: OfferPage,
})
