import * as v from "valibot"

export const ROLES = ["ADMIN", "USER", "DEMO"] as const

export const RoleSchema = v.picklist(ROLES)

export type Role = v.InferOutput<typeof RoleSchema>

export const UserSchema = v.object({
  id: v.string(),
  email: v.string(),
  role: RoleSchema,
})

export type User = v.InferOutput<typeof UserSchema>

export const UserListResponseSchema = v.array(UserSchema)
