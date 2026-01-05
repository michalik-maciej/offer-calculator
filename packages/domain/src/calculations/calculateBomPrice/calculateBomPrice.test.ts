import { describe, expect, it } from "vitest"

import { calculateBomPrice } from "./calculateBomPrice"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateBomPrice", () => {
  it("correctly sums the total price", () => {
    const result = calculateBomPrice(
      {
        bom: [
          { id: "shelf-100-47", quantity: 1 },
          { id: "shelf-80-47", quantity: 3 },
        ],
        discountPercentage: 10,
      },
      componentCatalogMock,
    )

    expect(result).toEqual({
      basePrice: 258.07,
      discountPrice: 232.26,
    })
  })

  it("throws if component not found", () => {
    expect(() =>
      calculateBomPrice(
        {
          bom: [{ id: "non-existent-id", quantity: 1 }],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
