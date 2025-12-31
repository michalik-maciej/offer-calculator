import { describe, expect, it } from "vitest"

import { aggregateOfferPrice } from "./aggregateOfferPrice"
import { componentCatalogMock } from "../../test/fixtures/componentCatalog"

describe("aggregateOfferPrice", () => {
  it("correctly sums the total price", () => {
    const result = aggregateOfferPrice({
      bom: [
        { id: "shelf-100-47", quantity: 1 },
        { id: "shelf-80-47", quantity: 3 },
      ],
      discountPercentage: 10,
      catalog: componentCatalogMock,
    })

    expect(result).toEqual({
      basePrice: 258.07,
      discountPrice: 232.26,
    })
  })

  it("throws if component not found", () => {
    expect(() =>
      aggregateOfferPrice({
        bom: [{ id: "non-existent-id", quantity: 1 }],
        catalog: componentCatalogMock,
      }),
    ).toThrow()
  })
})
