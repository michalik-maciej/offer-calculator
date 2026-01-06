import request from "supertest"
import { describe, expect, it } from "vitest"

import { app } from "../src/app"

describe("POST /api/calculate/offer", () => {
  it("returns BOM for valid linear wall layout", async () => {
    const response = await request(app).post("/api/calculate/offer").send({
      layouts: [],
      title: "Test Offer",
    })

    expect(response.status).toBe(200)
  })

  it("returns 400 for invalid payload", async () => {
    const response = await request(app).post("/api/calculate/offer").send({})

    expect(response.status).toBe(400)
    expect(response.body).toHaveProperty("issues")
    expect(response.body.issues).toHaveLength(2)
  })
})
