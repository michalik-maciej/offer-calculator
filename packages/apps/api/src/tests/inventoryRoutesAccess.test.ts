import jwt from "jsonwebtoken"
import request from "supertest"
import { describe, expect, it } from "vitest"
import { Prisma } from "@prisma/client"

import { componentCatalogMock } from "@/domain/fixtures/componentCatalog"

import { createInMemoryUserStore } from "./inMemoryUserStore"
import { createApp } from "../app"

process.env.JWT_SECRET = "test-secret"
const secret = process.env.JWT_SECRET

const app = createApp({
  getInventory: async () => componentCatalogMock,
  users: createInMemoryUserStore(),
})

function cookieFor(role: "ADMIN" | "DEMO" | "USER") {
  const token = jwt.sign(
    { sub: "66666666-6666-6666-6666-666666666666", email: "x@y.z", role },
    secret,
  )

  return `accessToken=${token}`
}

describe("inventory routes", () => {
  it.each(["USER", "DEMO"] as const)(
    "refuses to let a %s account change the catalogue",
    async (role) => {
      const cookie = cookieFor(role)

      const attempts = await Promise.all([
        request(app)
          .post("/api/inventory/items")
          .set("Cookie", cookie)
          .send({}),
        request(app)
          .put("/api/inventory/items/abc")
          .set("Cookie", cookie)
          .send({}),
        request(app).delete("/api/inventory/items/abc").set("Cookie", cookie),
      ])

      for (const res of attempts) {
        expect(res.status).toBe(403)
        expect(res.body).toEqual({ error: "Forbidden" })
      }
    },
  )

  it("lets an admin through to the catalogue controllers", async () => {
    const res = await request(app)
      .post("/api/inventory/items")
      .set("Cookie", cookieFor("ADMIN"))
      .send({})

    expect(res.status).toBe(400)
  })

  it("answers 404 when an admin changes a component that does not exist", async () => {
    const recordNotFound = async () => {
      throw new Prisma.PrismaClientKnownRequestError("Record not found", {
        code: "P2025",
        clientVersion: "test",
      })
    }
    const appWithoutComponent = createApp({
      components: {
        createComponent: recordNotFound,
        deleteComponent: recordNotFound,
        updateComponent: recordNotFound,
      },
      getInventory: async () => componentCatalogMock,
    })
    const missingId = "9c92ab09-1f56-403d-a86f-c70087645c62"

    const attempts = await Promise.all([
      request(appWithoutComponent)
        .put(`/api/inventory/items/${missingId}`)
        .set("Cookie", cookieFor("ADMIN"))
        .send({ price: 10 }),
      request(appWithoutComponent)
        .delete(`/api/inventory/items/${missingId}`)
        .set("Cookie", cookieFor("ADMIN")),
    ])

    for (const res of attempts) {
      expect(res.status).toBe(404)
      expect(res.body).toEqual({ error: "Component not found" })
    }
  })

  it("names the invalid field when an admin updates a component", async () => {
    const res = await request(app)
      .put("/api/inventory/items/9c92ab09-1f56-403d-a86f-c70087645c62")
      .set("Cookie", cookieFor("ADMIN"))
      .send({ price: "dziesięć" })

    expect(res.status).toBe(400)
    expect(res.body.issues.nested).toHaveProperty("price")
  })
})
