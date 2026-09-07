import { describe, expect, it } from "vitest"

import { calculateBaseCoverDemand } from "./calculateBaseCoverDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateBaseCoverDemand", () => {
  it("orders one cover per shelf unit, matched on width", () => {
    const result = calculateBaseCoverDemand(
      {
        shelfUnitsByWidth: [
          {
            width: 100,
            numberOfShelfUnits: 2,
          },
          {
            width: 80,
            numberOfShelfUnits: 1,
          },
        ],
      },
      componentCatalogMock,
    )

    expect(result).toEqual([
      { id: "base-cover-100", quantity: 2 },
      { id: "base-cover-80", quantity: 1 },
    ])
  })

  it("throws if base cover not found", () => {
    expect(() =>
      calculateBaseCoverDemand(
        {
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
