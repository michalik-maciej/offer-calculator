import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"
import { validOfferInput } from "@/domain/fixtures/validOfferInput"

import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"

const app = createApp({ getInventory: async () => componentCatalogMock })
const authCookie = `accessToken=${jwt.sign({ email: "tester@example.com" }, process.env.JWT_SECRET)}`

describe("POST /api/offers/preview", () => {
  it("returns offer preview for valid input", async () => {
    const res = await request(app)
      .post("/api/offers/preview")
      .set("Cookie", authCookie)
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
    const response = await request(app)
      .post("/api/offers/preview")
      .set("Cookie", authCookie)
      .send({})

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

  it("returns 422 when the layout asks for a component the inventory lacks", async () => {
    const unstockedHeightInput = {
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
      .set("Cookie", authCookie)
      .send(unstockedHeightInput)

    expect(res.status).toBe(422)
    expect(res.body).toMatchObject({
      error: "No leg found for height 9999cm",
      missingComponent: { category: "leg", height: 9999 },
    })
  })
})
