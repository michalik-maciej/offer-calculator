import { FieldPathByValue } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

export type NumericPath = FieldPathByValue<OfferInput, number>
export type CountPath = FieldPathByValue<OfferInput, number | undefined>

export type UnitsPath =
  | `layouts.${number}`
  | `layouts.${number}.gondolaUnits.${number}`
