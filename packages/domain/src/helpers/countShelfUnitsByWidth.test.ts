import { describe, expect, it } from "vitest"

import { countShelfUnitsByWidth } from "./countShelfUnitsByWidth"

describe("countShelfUnitsByWidth", () => {
  it("groups shelf units by width", () => {
    const result = countShelfUnitsByWidth(
      [
        { id: "unit-1", width: 100, quantity: 2, shelves: [] },
        { id: "unit-2", width: 80, quantity: 3, shelves: [] },
        { id: "unit-3", width: 100, quantity: 1, shelves: [] },
      ],
      4,
    )

    expect(result).toEqual([
      { width: 100, quantity: 12 },
      { width: 80, quantity: 12 },
    ])
  })
})
