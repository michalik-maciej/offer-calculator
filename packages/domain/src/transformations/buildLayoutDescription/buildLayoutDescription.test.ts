import { describe, expect, it } from "vitest"

import { buildLayoutDescription } from "./buildLayoutDescription"

describe("buildLayoutDescription", () => {
  it("builds description of wall layout", () => {
    const description = buildLayoutDescription({
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
    })

    expect(description).toEqual(
      "3 x ciąg regałów przyściennych / 4x80 / 1x100 / baza 47 / h-130 / półki 5x37",
    )
  })

  it("builds description of gondola layout", () => {
    const description = buildLayoutDescription({
      height: 130,
      numberOfLayouts: 1,
      gondolaUnits: [
        {
          depth: 47,
          numberOfGondolaUnits: 2,
          shelfUnits: [
            {
              numberOfShelfUnits: 2,
              shelves: [],
              width: 80,
            },
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
        {
          depth: 37,
          numberOfGondolaUnits: 1,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
      ],
      extras: [{ id: "extra-37", quantity: 2 }],
    })

    expect(description).toEqual(
      "1 x ciąg regałów dwustronnych / 2x80 / 1x100 / baza 47 / h-130",
    )
  })

  it("returns default description", () => {
    expect(buildLayoutDescription(null)).toEqual("opis niedostępny")
  })
})
