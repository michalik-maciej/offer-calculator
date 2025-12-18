import { describe, it, expect } from "vitest"
import { calculateFootDemand } from "./calculateFootDemand"
import { componentCatalogMock } from "../test/fixtures/componentCatalog"

describe("calculateFootDemand", () => {
  it("calculates feet correctly", () => {
    const result = calculateFootDemand(
      { depth: 37, numberOfShelfUnits: 3 },
      componentCatalogMock,
    )
    expect(result).toEqual([{ id: "foot-37", quantity: 4 }])
  })

  it("throws if foot not found", () => {
    expect(() =>
      calculateFootDemand(
        { depth: 50, numberOfShelfUnits: 2 },
        componentCatalogMock,
      ),
    ).toThrow()
  })
})
