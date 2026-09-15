import * as v from "valibot"

const DEFAULT_PORT = 3000

const EnvSchema = v.object({
  DATABASE_URL: v.pipe(
    v.string("DATABASE_URL is required"),
    v.url("DATABASE_URL must be a connection URL"),
  ),
  JWT_SECRET: v.pipe(
    v.string("JWT_SECRET is required"),
    v.minLength(1, "JWT_SECRET must not be empty"),
  ),
  PORT: v.optional(
    v.pipe(v.string(), v.regex(/^\d+$/, "PORT must be a number")),
  ),
  WEBAPP_DOMAIN: v.pipe(
    v.string("WEBAPP_DOMAIN is required"),
    v.url("WEBAPP_DOMAIN must be the front end origin, including the scheme"),
  ),
})

export type Env = {
  DATABASE_URL: string
  JWT_SECRET: string
  PORT: number
  WEBAPP_DOMAIN: string
}

/**
 * Reads the environment the API needs and refuses anything incomplete.
 */
export function parseEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const { issues, output, success } = v.safeParse(EnvSchema, source)

  if (!success) {
    const { nested } = v.flatten<typeof EnvSchema>(issues)
    const problems = Object.entries(nested ?? {}).map(
      ([variable, messages]) => `  ${variable}: ${messages?.join(", ")}`,
    )

    throw new Error(["Invalid environment:", ...problems].join("\n"))
  }

  return { ...output, PORT: Number(output.PORT ?? DEFAULT_PORT) }
}
