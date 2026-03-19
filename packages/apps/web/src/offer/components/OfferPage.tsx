import { FormCalculation } from "./FormCalculation"
import { OfferList } from "./OfferList"
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
