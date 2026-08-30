import { FormCalculation } from "./FormCalculation"
import { OfferPreview } from "./OfferPreview"

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
