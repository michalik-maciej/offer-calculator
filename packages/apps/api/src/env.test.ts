import { describe, expect, it } from "vitest"

import { parseEnv } from "./env"

const completeEnv = {
  DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
  JWT_SECRET: "a-long-enough-secret",
  WEBAPP_DOMAIN: "https://example.com",
}

describe("parseEnv", () => {
  it("returns the variables the API needs, with the default port", () => {
    expect(parseEnv(completeEnv)).toEqual({
      DATABASE_URL: "postgresql://user:pass@localhost:5432/app",
      JWT_SECRET: "a-long-enough-secret",
      PORT: 3000,
      WEBAPP_DOMAIN: "https://example.com",
    })
  })

  it("reads the port when one is set", () => {
    expect(parseEnv({ ...completeEnv, PORT: "8080" }).PORT).toBe(8080)
  })

  it("names every missing variable at once", () => {
    expect(() => parseEnv({})).toThrowError(
      /DATABASE_URL.*\n.*JWT_SECRET.*\n.*WEBAPP_DOMAIN/s,
    )
  })

  it("rejects a front end origin that is not a URL", () => {
    expect(() =>
      parseEnv({ ...completeEnv, WEBAPP_DOMAIN: "example.com" }),
    ).toThrowError(/WEBAPP_DOMAIN/)
  })

  it("rejects a port that is not a number", () => {
    expect(() => parseEnv({ ...completeEnv, PORT: "http" })).toThrowError(
      /PORT must be a number/,
    )
  })

  it("rejects an empty secret", () => {
    expect(() => parseEnv({ ...completeEnv, JWT_SECRET: "" })).toThrowError(
      /JWT_SECRET/,
    )
  })
})
