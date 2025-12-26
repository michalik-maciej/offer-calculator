import request from "supertest"
import { describe, expect, it } from "vitest"

import { app } from "../src/app"

describe("POST /api/calculate/linear-wall", () => {
  it("returns BOM for valid linear wall layout", async () => {
    const response = await request(app)
      .post("/api/calculate/linear-wall")
      .send({
        height: 180,
        depth: 47,
        numberOfLayouts: 1,
        quantity: 1,
        shelfUnits: [
          {
            width: 100,
            quantity: 1,
            shelves: [],
          },
        ],
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty("bom")
    expect(response.body.bom).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(String),
          quantity: expect.any(Number),
        }),
      ]),
    )
  })

  it("returns 400 for invalid payload", async () => {
    const response = await request(app)
      .post("/api/calculate/linear-wall")
      .send({
        quantity: 1,
      })

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("message")
  })
})
