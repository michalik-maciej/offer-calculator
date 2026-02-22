import * as v from "valibot"

export const LoginInputSchema = v.object({
  email: v.pipe(v.string(), v.email()),
  password: v.pipe(v.string(), v.minLength(8)),
})

export type LoginInput = v.InferInput<typeof LoginInputSchema>
