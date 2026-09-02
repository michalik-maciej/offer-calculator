import { LayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferInput } from "@/schemas/Offer.schema"

// The editor currently builds wall runs only. Narrowing the union here keeps
// react-hook-form field paths typed; LayoutWall[] still satisfies OfferInput.
export type WallOfferInput = Omit<OfferInput, "layouts"> & {
  layouts: LayoutWall[]
}
