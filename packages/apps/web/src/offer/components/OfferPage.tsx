import { validOfferInput } from "@/domain/fixtures/validOfferInput"

import { Button } from "../../core/ui/button"
import { usePreviewOffer } from "../hooks/usePreviewOffer"

export function OfferPage() {
  const previewOffer = usePreviewOffer()

  return (
    <section>
      <h1>Offer</h1>
      <Button onClick={() => previewOffer.mutate(validOfferInput)}>
        Preview offer
      </Button>
    </section>
  )
}
