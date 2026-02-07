import request from "supertest"
import { describe, expect, it } from "vitest"
import { validOfferInput } from "@domain/fixtures/validOfferInput"

import { app } from "../app"

describe("POST /api/offers/preview", () => {
  it("returns offer preview for valid input", async () => {
    const res = await request(app)
      .post("/api/offers/preview")
      .send(validOfferInput)

    expect(res.status).toBe(200)
    expect(res.body).toMatchObject({
      breakdown: expect.any(Object),
      layouts: expect.any(Array),
      pricing: expect.any(Object),
      title: "Offer test",
    })
  })

  it("returns 400 for invalid payload", async () => {
    const response = await request(app).post("/api/offers/preview").send({})

    expect(response.status).toBe(400)
    expect(response.body).toMatchObject({
      error: "Invalid input",
      issues: {
        nested: {
          discountPercentage: expect.any(Array),
          layouts: expect.any(Array),
          title: expect.any(Array),
        },
      },
    })
  })

  it("returns 500 when calculation fails", async () => {
    const invalidCatalogInput = {
      ...validOfferInput,
      layouts: [
        {
          ...validOfferInput.layouts[0],
          height: 9999,
        },
      ],
    }

    const res = await request(app)
      .post("/api/offers/preview")
      .send(invalidCatalogInput)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({
      error: "Calculation failed",
    })
  })
})
