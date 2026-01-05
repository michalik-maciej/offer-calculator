import { describe, expect, it } from "vitest"

import { calculateOfferDemand } from "./calculateOfferDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateOfferDemand", () => {
  it("returns complete demand", () => {
    const result = calculateOfferDemand(
      [
        {
          height: 130,
          numberOfLayouts: 1,
          gondolaUnits: [
            {
              depth: 37,
              numberOfGondolaUnits: 1,
              shelfUnits: [
                {
                  numberOfShelfUnits: 1,
                  shelves: [],
                  width: 80,
                },
              ],
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
              numberOfShelfUnits: 1,
              shelves: [],
            },
          ],
        },
      ],
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 3 },
      { id: "shelf-80-37", quantity: 1 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-37", quantity: 2 },
      { id: "back-40-100", quantity: 5 },
      { id: "shelf-100-47", quantity: 1 },
      { id: "leg-210-8-3", quantity: 2 },
      { id: "foot-47", quantity: 2 },
    ]

    expect(result).toHaveLength(8)
    expect(result).toEqual(expectedResult)
  })
})
