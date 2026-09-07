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
          numberOfShelfUnits: 1,
        },
        {
          width: 80,
          numberOfShelfUnits: 3,
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

  it("doubles every panel for the double back variant", () => {
    const result = calculateBackPanelDemand(
      {
        backVariant: 2,
        height: 180,
        shelfUnitsByWidth: [
          {
            width: 100,
            numberOfShelfUnits: 1,
          },
          {
            width: 80,
            numberOfShelfUnits: 3,
          },
        ],
      },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "back-40-100", quantity: 8 },
      { id: "back-10-100", quantity: 2 },
      { id: "back-40-80", quantity: 24 },
      { id: "back-10-80", quantity: 6 },
    ])
  })

  it("orders no panels at all for a run without backs", () => {
    const result = calculateBackPanelDemand(
      {
        backVariant: 0,
        height: 180,
        shelfUnitsByWidth: [
          {
            width: 16,
            numberOfShelfUnits: 1,
          },
        ],
      },
      componentCatalogMock,
    )

    expect(result).toEqual([])
  })

  it("throws if back panel not found", () => {
    expect(() =>
      calculateBackPanelDemand(
        {
          height: 180,
          shelfUnitsByWidth: [
            {
              width: 16,
              numberOfShelfUnits: 1,
            },
          ],
        },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
