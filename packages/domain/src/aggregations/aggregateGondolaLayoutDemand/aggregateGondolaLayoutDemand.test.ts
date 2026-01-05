import { describe, expect, it } from "vitest"

import { aggregateGondolaLayoutDemand } from "./aggregateGondolaLayoutDemand"
import { componentCatalogMock } from "../../test/fixtures/componentCatalog"

describe("aggregateGondolaLayoutDemand", () => {
  it("returns complete demand", () => {
    const result = aggregateGondolaLayoutDemand(
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
        extras: [{ id: "extra-37", quantity: 2 }],
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
      { id: "extra-37", quantity: 2 },
    ]

    expect(result).toHaveLength(11)
    expect(result).toEqual(expectedResult)
  })
})
