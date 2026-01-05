import { describe, expect, it } from "vitest"

import { calculateLegDemand } from "./calculateLegDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateLegDemand", () => {
  it("calculates legs correctly", () => {
    const result = calculateLegDemand(
      { height: 180, numberOfLayouts: 3, numberOfUnits: 3 },
      componentCatalogMock,
    )
    expect(result).toEqual([{ id: "leg-180-8-3", quantity: 12 }])
  })

  it("throws if leg not found", () => {
    expect(() =>
      calculateLegDemand(
        { height: 50, numberOfLayouts: 1, numberOfUnits: 1 },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
