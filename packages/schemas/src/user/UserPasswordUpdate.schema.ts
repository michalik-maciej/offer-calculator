import * as v from "valibot"

export const UserPasswordUpdateSchema = v.object({
  password: v.pipe(v.string(), v.minLength(8)),
})

export type UserPasswordUpdateInput = v.InferInput<
  typeof UserPasswordUpdateSchema
>
