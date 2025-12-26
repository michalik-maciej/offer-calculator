import { describe, expect, it } from "vitest"

import { calculateLinearWallDemand } from "./calculateLinearWallDemand"
import { componentCatalogMock } from "../test/fixtures/componentCatalog"

describe("calculateLinearWallDemand", () => {
  it("returns complete demand", () => {
    const result = calculateLinearWallDemand(
      {
        depth: 47,
        height: 130,
        id: "layout-1",
        numberOfLayouts: 2,
        shelfUnits: [
          {
            id: "shelf-unit-1",
            width: 100,
            quantity: 1,
            shelves: [
              { id: "shelf-1.1", depth: 37, quantity: 1 },
              { id: "shelf-1.2", depth: 47, quantity: 1 },
            ],
          },
          {
            id: "shelf-unit-2",
            width: 80,
            quantity: 4,
            shelves: [{ id: "shelf-2.1", depth: 37, quantity: 5 }],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-100", quantity: 6 },
      { id: "back-40-80", quantity: 24 },
      { id: "shelf-100-47", quantity: 4 },
      { id: "shelf-80-47", quantity: 8 },
      { id: "shelf-100-37", quantity: 2 },
      { id: "support-37", quantity: 84 },
      { id: "support-47", quantity: 4 },
      { id: "shelf-80-37", quantity: 40 },
      { id: "leg-130-8-3", quantity: 12 },
      { id: "foot-47", quantity: 12 },
    ]

    expect(result).toHaveLength(10)
    expect(result).toEqual(expectedResult)
  })
})
