import { describe, expect, it } from "vitest"

import { groupDemandByCategory } from "./groupDemandByCategory"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("groupDemandByCategory", () => {
  it("groups raw demand by product category", () => {
    const result = groupDemandByCategory(
      [
        { id: "back-40-80", quantity: 3 },
        { id: "shelf-80-37", quantity: 1 },
        { id: "shelf-100-47", quantity: 1 },
      ],
      componentCatalogMock,
    )

    expect(result).toEqual({
      back: [
        {
          id: "back-40-80",
          label: "Plecy 40/80",
          quantity: 3,
        },
      ],
      shelf: [
        {
          id: "shelf-80-37",
          label: "Półka 80/37",
          quantity: 1,
        },
        {
          id: "shelf-100-47",
          label: "Półka 100/47",
          quantity: 1,
        },
      ],
    })
  })

  it("throws an error when a component id is not found in the catalog", () => {
    expect(() =>
      groupDemandByCategory(
        [{ id: "unknown-component", quantity: 2 }],
        componentCatalogMock,
      ),
    ).toThrowError('Component with id "unknown-component" not found in catalog')
  })
})
