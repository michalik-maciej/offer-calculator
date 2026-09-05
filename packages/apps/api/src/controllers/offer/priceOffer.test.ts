import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"
import { validOfferInput } from "@/domain/fixtures/validOfferInput"

import { priceOffer } from "./priceOffer"

describe("priceOffer", () => {
  it("prices a configuration the catalogue can satisfy", () => {
    const { missingComponent, output } = priceOffer(
      validOfferInput,
      componentCatalogMock,
    )

    expect(missingComponent).toBeUndefined()
    expect(output?.pricing.basePrice).toBeGreaterThan(0)
  })

  it("keeps the offer priceable-later when a component is missing", () => {
    const unstockedHeight = {
      ...validOfferInput,
      layouts: validOfferInput.layouts.map((layout) => ({
        ...layout,
        height: 9999,
      })),
    }

    const { missingComponent, output } = priceOffer(
      unstockedHeight,
      componentCatalogMock,
    )

    expect(output).toBeNull()
    expect(missingComponent).toEqual({ category: "leg", height: 9999 })
  })
})
