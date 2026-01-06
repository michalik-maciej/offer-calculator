import { describe, expect, it } from "vitest"

import { createOfferPreview } from "./createOfferPreview"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("createOfferPreview", () => {
  it("returns offer preview", () => {
    const response = createOfferPreview(
      {
        discountPercentage: 10,
        layouts: [
          {
            height: 180,
            depth: 47,
            numberOfLayouts: 1,
            shelfUnits: [
              {
                width: 100,
                numberOfShelfUnits: 1,
                shelves: [],
              },
            ],
          },
        ],
        title: "Test Offer",
      },
      componentCatalogMock,
    )

    expect(response).toHaveProperty("demandBreakdown")

    expect(response).toHaveProperty("title")
    expect(response.title).toEqual("Test Offer")

    expect(response).toHaveProperty("basePrice")
    expect(response.basePrice).toBeTypeOf("number")

    expect(response).toHaveProperty("discountPrice")
    expect(response.discountPrice).toBeTypeOf("number")

    expect(response).toHaveProperty("layouts")
    expect(response.layouts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          basePrice: expect.any(Number),
          description: expect.any(String),
        }),
      ]),
    )
  })
})
