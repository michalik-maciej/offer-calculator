import { describe, expect, it } from "vitest"

import { calculateOfferDemand } from "./calculateOfferDemand"
import { componentCatalogMock } from "../test/fixtures/componentCatalog"

describe("calculateOfferDemand", () => {
  it("returns complete demand", () => {
    const result = calculateOfferDemand(
      [
        {
          depth: 47,
          height: 130,
          numberOfLayouts: 1,
          shelfUnits: [
            {
              width: 80,
              quantity: 1,
              shelves: [],
            },
          ],
        },
        {
          depth: 37,
          height: 210,
          numberOfLayouts: 1,
          shelfUnits: [
            {
              width: 100,
              quantity: 1,
              shelves: [],
            },
          ],
        },
      ],
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 3 },
      { id: "shelf-80-47", quantity: 1 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-47", quantity: 2 },
      { id: "back-40-100", quantity: 5 },
      { id: "shelf-100-37", quantity: 1 },
      { id: "leg-210-8-3", quantity: 2 },
      { id: "foot-37", quantity: 2 },
    ]

    expect(result).toHaveLength(8)
    expect(result).toEqual(expectedResult)
  })
})
