import { FormCalculation } from "./FormCalculation"
import { OfferLayouts } from "./OfferLayouts"

export function OfferPage() {
  return (
    <section>
      <h1 className="px-8 pt-8 text-xl font-semibold">Oferta</h1>
      <FormCalculation>
        <OfferLayouts />
      </FormCalculation>
    </section>
  )
}
