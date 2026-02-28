import * as v from "valibot"

import { JwtPayloadSchema } from "./JwtPayload.schema"

export const AuthUserResponseSchema = v.object({
  user: JwtPayloadSchema,
})

export type AuthUserResponse = v.InferOutput<typeof AuthUserResponseSchema>
