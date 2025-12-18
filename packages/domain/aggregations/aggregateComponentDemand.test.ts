import { describe, it, expect } from "vitest"
import { aggregateComponentDemand } from "./aggregateComponentDemand"

describe("aggregateComponentDemand", () => {
  it("correctly transforms raw input", () => {
    const result = aggregateComponentDemand([
      { id: "id-1", quantity: 4 },
      { id: "id-2", quantity: 10 },
      { id: "id-3", quantity: 10 },
      { id: "id-1", quantity: 2 },
    ])

    expect(result).toEqual([
      { id: "id-1", quantity: 6 },
      { id: "id-2", quantity: 10 },
      { id: "id-3", quantity: 10 },
    ])
  })
})
