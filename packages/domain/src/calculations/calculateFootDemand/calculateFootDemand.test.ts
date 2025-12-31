import { describe, expect, it } from "vitest"

import { calculateFootDemand } from "./calculateFootDemand"
import { componentCatalogMock } from "../../test/fixtures/componentCatalog"

describe("calculateFootDemand", () => {
  it("calculates feet correctly", () => {
    const result = calculateFootDemand(
      { depth: 37, numberOfShelfUnits: 9, numberOfLayouts: 4 },
      componentCatalogMock,
    )
    expect(result).toEqual([{ id: "foot-37", quantity: 40 }])
  })

  it("throws if foot not found", () => {
    expect(() =>
      calculateFootDemand(
        { depth: 50, numberOfShelfUnits: 2, numberOfLayouts: 1 },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
