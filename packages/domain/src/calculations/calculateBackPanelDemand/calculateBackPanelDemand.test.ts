import { describe, expect, it } from "vitest"

import { calculateBackPanelDemand } from "./calculateBackPanelDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateBackPanelDemand", () => {
  it("calculates back panels correctly", () => {
    const mockInput = {
      height: 180,
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
      { id: "back-40-100", quantity: 4 },
      { id: "back-10-100", quantity: 1 },
      { id: "back-40-80", quantity: 12 },
      { id: "back-10-80", quantity: 3 },
    ]

    const result = calculateBackPanelDemand(mockInput, componentCatalogMock)
    expect(result).toEqual(expectedResult)
  })

  it("throws if back panel not found", () => {
    expect(() =>
      calculateBackPanelDemand(
        {
          height: 180,
          shelfUnitsByWidth: [
            {
              width: 16,
              quantity: 1,
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
