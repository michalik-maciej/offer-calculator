import { describe, expect, it } from "vitest"

import { calculateLegDemand } from "./calculateLegDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"
import { isMissingComponentError } from "../../models/missingComponentError"

describe("calculateLegDemand", () => {
  it("calculates legs correctly", () => {
    const result = calculateLegDemand(
      { height: 180, numberOfLayouts: 3, numberOfUnits: 3 },
      componentCatalogMock,
    )
    expect(result).toEqual([{ id: "leg-180-8-3", quantity: 12 }])
  })

  it("throws a missing component error carrying the failed lookup", () => {
    let thrown: unknown

    try {
      calculateLegDemand(
        { height: 50, numberOfLayouts: 1, numberOfUnits: 1 },
        componentCatalogMock,
      )
    } catch (error) {
      thrown = error
    }

    expect(isMissingComponentError(thrown)).toBe(true)
    expect(thrown).toMatchObject({ query: { category: "leg", height: 50 } })
  })
})
