import { describe, expect, it } from "vitest"

import { aggregateGondolaDemand } from "./aggregateGondolaDemand"
import { componentCatalogMock } from "../../test/fixtures/componentCatalog"

describe("aggregateGondolaDemand", () => {
  it("returns complete demand", () => {
    const result = aggregateGondolaDemand(
      {
        height: 130,
        numberOfLayouts: 1,
        gondolaUnits: [
          {
            depth: 47,
            numberOfGondolaUnits: 2,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 100,
              },
            ],
          },
          {
            depth: 37,
            numberOfGondolaUnits: 1,
            shelfUnits: [
              {
                numberOfShelfUnits: 1,
                shelves: [],
                width: 100,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 12 },
      { id: "back-40-100", quantity: 6 },
      { id: "shelf-80-47", quantity: 4 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "leg-130-8-3", quantity: 8 },
      { id: "foot-47", quantity: 8 },
      { id: "back-40-100", quantity: 3 },
      { id: "shelf-100-37", quantity: 1 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-37", quantity: 2 },
    ]

    expect(result).toHaveLength(10)
    expect(result).toEqual(expectedResult)
  })
})
