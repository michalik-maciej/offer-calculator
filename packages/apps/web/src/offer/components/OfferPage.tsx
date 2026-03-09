import { FormCalculation } from "packages/apps/web/src/offer/components/FormCalculation"
import { OfferPreview } from "packages/apps/web/src/offer/components/OfferPreview"

export function OfferPage() {
  return (
    <section>
      <h1>Oferta</h1>
      <FormCalculation>
        <OfferPreview />
      </FormCalculation>
    </section>
  )
}
