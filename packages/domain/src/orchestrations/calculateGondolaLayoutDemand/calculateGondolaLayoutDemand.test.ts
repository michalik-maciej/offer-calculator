import { describe, expect, it } from "vitest"

import { calculateGondolaLayoutDemand } from "./calculateGondolaLayoutDemand"
import { componentCatalogMock } from "../../fixtures/componentCatalog"

describe("calculateGondolaLayoutDemand", () => {
  it("returns complete demand", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 1,
        gondolaUnits: [
          {
            depth: 47,
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
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 12 },
      { id: "back-40-100", quantity: 6 },
      { id: "shelf-80-47", quantity: 4 },
      { id: "shelf-100-47", quantity: 2 },
      { id: "leg-130-8-3", quantity: 4 },
      { id: "foot-47", quantity: 8 },
      { id: "back-40-100", quantity: 6 },
      { id: "shelf-100-37", quantity: 2 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-37", quantity: 4 },
      { id: "extra-37", quantity: 2 },
    ]

    expect(result).toHaveLength(11)
    expect(result).toEqual(expectedResult)
  })

  it("counts one upright column per run copy", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 3,
        gondolaUnits: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 36 },
      { id: "shelf-80-47", quantity: 12 },
      { id: "leg-130-8-3", quantity: 9 },
      { id: "foot-47", quantity: 18 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("counts feet per side while uprights stay shared", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 2,
        gondolaUnits: [
          {
            depth: 37,
            shelfUnits: [
              {
                numberOfShelfUnits: 3,
                shelves: [],
                width: 100,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-100", quantity: 36 },
      { id: "shelf-100-37", quantity: 12 },
      { id: "leg-130-8-3", quantity: 8 },
      { id: "foot-37", quantity: 16 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("passes the back variant and the base cover down to both sides", () => {
    const result = calculateGondolaLayoutDemand(
      {
        backVariant: 2,
        hasBaseCover: true,
        height: 130,
        numberOfLayouts: 1,
        gondolaUnits: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 24 },
      { id: "base-cover-80", quantity: 4 },
      { id: "shelf-80-47", quantity: 4 },
      { id: "leg-130-8-3", quantity: 3 },
      { id: "foot-47", quantity: 6 },
    ]

    expect(result).toEqual(expectedResult)
  })

  it("charges each end cap as a run of its own", () => {
    const result = calculateGondolaLayoutDemand(
      {
        height: 130,
        numberOfLayouts: 2,
        gondolaUnits: [
          {
            depth: 47,
            shelfUnits: [
              {
                numberOfShelfUnits: 2,
                shelves: [],
                width: 80,
              },
            ],
          },
        ],
        leftEndCap: {
          backVariant: 0,
          depth: 37,
          hasBaseCover: true,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
        rightEndCap: {
          depth: 37,
          shelfUnits: [
            {
              numberOfShelfUnits: 1,
              shelves: [],
              width: 100,
            },
          ],
        },
      },
      componentCatalogMock,
    )

    const expectedResult = [
      { id: "back-40-80", quantity: 24 },
      { id: "shelf-80-47", quantity: 8 },
      { id: "leg-130-8-3", quantity: 6 },
      { id: "foot-47", quantity: 12 },
      { id: "base-cover-100", quantity: 1 },
      { id: "shelf-100-37", quantity: 1 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-37", quantity: 2 },
      { id: "back-40-100", quantity: 3 },
      { id: "shelf-100-37", quantity: 1 },
      { id: "leg-130-8-3", quantity: 2 },
      { id: "foot-37", quantity: 2 },
    ]

    expect(result).toEqual(expectedResult)
  })
})
