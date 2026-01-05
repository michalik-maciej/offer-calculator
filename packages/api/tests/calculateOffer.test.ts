import request from "supertest"
import { describe, expect, it } from "vitest"

import { app } from "../src/app"

describe("POST /api/calculate/offer", () => {
  it("returns BOM for valid linear wall layout", async () => {
    const response = await request(app)
      .post("/api/calculate/offer")
      .send({
        discountPercentage: 10,
        layouts: [
          {
            height: 180,
            depth: 47,
            numberOfLayouts: 1,
            quantity: 1,
            shelfUnits: [
              {
                width: 100,
                numberOfShelfUnits: 1,
                shelves: [],
              },
            ],
          },
        ],
        title: "Test Offer",
      })

    expect(response.status).toBe(200)

    expect(response.body).toHaveProperty("demandBreakdown")

    expect(response.body).toHaveProperty("title")
    expect(response.body.title).toEqual("Test Offer")

    expect(response.body).toHaveProperty("basePrice")
    expect(response.body.basePrice).toBeTypeOf("number")

    expect(response.body).toHaveProperty("discountPrice")
    expect(response.body.discountPrice).toBeTypeOf("number")

    expect(response.body).toHaveProperty("layouts")
    expect(response.body.layouts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          basePrice: expect.any(Number),
          description: expect.any(String),
        }),
      ]),
    )
  })

  it("returns 400 for invalid payload", async () => {
    const response = await request(app).post("/api/calculate/offer").send({
      quantity: 1,
    })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("issues")
    expect(response.body.issues).toHaveLength(3)
  })
})
