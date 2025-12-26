import { describe, expect, it } from "vitest"

import { calculateShelfDemand } from "./calculateShelfDemand"
import { componentCatalogMock } from "../test/fixtures/componentCatalog"

describe("calculateShelfDemand", () => {
  it("calculates shelves correctly", () => {
    const mockInput = {
      numberOfLayouts: 2,
      shelfUnits: [
        {
          id: "shelf-unit-1",
          width: 100,
          quantity: 2,
          shelves: [
            { id: "shelf-1.1", depth: 37, quantity: 4 },
            { id: "shelf-1.2", depth: 47, quantity: 2 },
          ],
        },
        {
          id: "shelf-unit-2",
          width: 80,
          quantity: 1,
          shelves: [{ id: "shelf-2.1", depth: 37, quantity: 5 }],
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
              id: "shelf-unit-1",
              width: 80,
              quantity: 1,
              shelves: [{ id: "shelf-1", depth: 39, quantity: 1 }],
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
