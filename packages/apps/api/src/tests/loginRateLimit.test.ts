import request from "supertest"
import { describe, expect, it } from "vitest"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createApp } from "../app"

const FAILED_ATTEMPTS_ALLOWED = 10

function attemptLogin(app: ReturnType<typeof createApp>) {
  return request(app).post("/api/auth/login").send({ email: "", password: "" })
}

describe("POST /api/auth/login rate limit", () => {
  it("lets the allowed number of failed attempts through, then answers 429", async () => {
    const app = createApp({ getInventory: async () => componentCatalogMock })

    for (let attempt = 0; attempt < FAILED_ATTEMPTS_ALLOWED; attempt++) {
      const res = await attemptLogin(app)
      expect(res.status).toBe(400)
    }

    const blocked = await attemptLogin(app)

    expect(blocked.status).toBe(429)
    expect(blocked.body).toEqual({ error: "Too many login attempts" })
  })

  it("keeps the budget per app rather than sharing one counter", async () => {
    const exhausted = createApp({
      getInventory: async () => componentCatalogMock,
    })

    for (let attempt = 0; attempt <= FAILED_ATTEMPTS_ALLOWED; attempt++) {
      await attemptLogin(exhausted)
    }

    const fresh = createApp({ getInventory: async () => componentCatalogMock })
    const res = await attemptLogin(fresh)

    expect(res.status).toBe(400)
  })
})
