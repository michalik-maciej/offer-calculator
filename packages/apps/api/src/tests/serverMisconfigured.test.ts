import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createApp } from "../app"

const cookie = `accessToken=${jwt.sign({ sub: "1", email: "a@b.c", role: "USER" }, "some-secret")}`

delete process.env.JWT_SECRET

const app = createApp({ getInventory: async () => componentCatalogMock })

describe("guarded routes without JWT_SECRET", () => {
  it("answers 500 rather than blaming the caller", async () => {
    const res = await request(app).get("/api/offers").set("Cookie", cookie)

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Server misconfigured" })
  })

  it("answers the same to a caller with no cookie at all", async () => {
    const res = await request(app).get("/api/offers")

    expect(res.status).toBe(500)
    expect(res.body).toEqual({ error: "Server misconfigured" })
  })
})
