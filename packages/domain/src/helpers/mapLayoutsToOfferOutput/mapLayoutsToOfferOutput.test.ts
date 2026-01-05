import { describe, expect, it } from "vitest"

import { mapLayoutsToOfferOutput } from "./mapLayoutsToOfferOutput"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("mapLayoutsToOfferOutput", () => {
  it("builds description of wall layout", () => {
    const output = mapLayoutsToOfferOutput(
      [
        {
          depth: 47,
          height: 130,
          numberOfLayouts: 3,
          shelfUnits: [
            {
              width: 80,
              numberOfShelfUnits: 4,
              shelves: [{ depth: 37, numberOfShelves: 5 }],
            },
            {
              width: 100,
              numberOfShelfUnits: 1,
              shelves: [
                { depth: 37, numberOfShelves: 1 },
                { depth: 47, numberOfShelves: 1 },
              ],
            },
          ],
        },
      ],
      componentCatalogMock,
    )

    expect(output).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          description: expect.any(String),
          basePrice: expect.any(Number),
        }),
      ]),
    )
  })
})
