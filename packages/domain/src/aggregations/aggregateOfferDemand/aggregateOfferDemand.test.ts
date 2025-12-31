import { describe, expect, it } from "vitest"

import { aggregateOfferDemand } from "./aggregateOfferDemand"
import { componentCatalogMock } from "../../test/fixtures/componentCatalog"

describe("aggregateOfferDemand", () => {
  it("returns complete demand", () => {
    const result = aggregateOfferDemand(
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
          depth: 47,
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
      { id: "foot-47", quantity: 4 },
      { id: "back-40-100", quantity: 5 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "leg-210-8-3", quantity: 2 },
    ]

    expect(result).toHaveLength(7)
    expect(result).toEqual(expectedResult)
  })
})
