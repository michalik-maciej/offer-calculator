import { describe, expect, it } from "vitest"

import { aggregateWallDemand } from "./aggregateWallDemand"
import { componentCatalogMock } from "../../test/fixtures/componentCatalog"

describe("aggregateWallDemand", () => {
  it("returns complete demand", () => {
    const result = aggregateWallDemand(
      {
        depth: 47,
        height: 130,
        numberOfLayouts: 2,
        shelfUnits: [
          {
            width: 100,
            numberOfShelfUnits: 1,
            shelves: [
              { depth: 37, numberOfShelves: 1 },
              { depth: 47, numberOfShelves: 1 },
            ],
          },
          {
            width: 80,
            numberOfShelfUnits: 4,
            shelves: [{ depth: 37, numberOfShelves: 5 }],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-100", quantity: 6 },
      { id: "back-40-80", quantity: 24 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "shelf-80-47", quantity: 8 },
      { id: "shelf-100-37", quantity: 2 },
      { id: "support-37", quantity: 84 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "support-47", quantity: 4 },
      { id: "shelf-80-37", quantity: 40 },
      { id: "leg-130-8-3", quantity: 12 },
      { id: "foot-47", quantity: 12 },
    ]

    expect(result).toHaveLength(11)
    expect(result).toEqual(expectedResult)
  })
})
