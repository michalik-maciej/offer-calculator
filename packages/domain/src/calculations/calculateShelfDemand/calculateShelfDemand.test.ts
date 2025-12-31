import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "../../test/fixtures/componentCatalog"
import { calculateShelfDemand } from "../calculateShelfDemand/calculateShelfDemand"

describe("calculateShelfDemand", () => {
  it("calculates shelves correctly", () => {
    const mockInput = {
      numberOfLayouts: 2,
      shelfUnits: [
        {
          width: 100,
          quantity: 2,
          shelves: [
            { depth: 37, quantity: 4 },
            { depth: 47, quantity: 2 },
          ],
        },
        {
          width: 80,
          quantity: 1,
          shelves: [{ depth: 37, quantity: 5 }],
        },
      ],
    }

    const expectedResult = [
      { id: "shelf-100-37", quantity: 16 },
      { id: "support-37", quantity: 52 },
      { id: "shelf-100-47", quantity: 8 },
      { id: "support-47", quantity: 16 },
      { id: "shelf-80-37", quantity: 10 },
    ]

    const result = calculateShelfDemand(mockInput, componentCatalogMock)
    expect(result).toEqual(expectedResult)
  })

  it("throws if shelf not found", () => {
    expect(() =>
      calculateShelfDemand(
        {
          numberOfLayouts: 1,
          shelfUnits: [
            {
              width: 80,
              quantity: 1,
              shelves: [{ depth: 39, quantity: 1 }],
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
