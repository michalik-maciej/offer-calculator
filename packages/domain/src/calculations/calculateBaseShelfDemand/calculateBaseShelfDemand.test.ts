import { describe, expect, it } from "vitest"

import { calculateBaseShelfDemand } from "./calculateBaseShelfDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateBaseShelfDemand", () => {
  it("calculates shelves correctly", () => {
    const mockInput = {
      depth: 47,
      shelfUnitsByWidth: [
        {
          width: 100,
          quantity: 1,
        },
        {
          width: 80,
          quantity: 3,
        },
      ],
    }

    const expectedResult = [
      { id: "shelf-100-47", quantity: 1 },
      { id: "shelf-80-47", quantity: 3 },
    ]

    const result = calculateBaseShelfDemand(mockInput, componentCatalogMock)
    expect(result).toEqual(expectedResult)
  })

  it("throws if shelf not found", () => {
    expect(() =>
      calculateBaseShelfDemand(
        {
          depth: 5,
          shelfUnitsByWidth: [
            {
              width: 100,
              quantity: 1,
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
