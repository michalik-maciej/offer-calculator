import { Response } from "express"
import jwt from "jsonwebtoken"
import { User } from "@prisma/client"

const TOKEN_LIFETIME = "7d"

export type SessionUser = Pick<User, "email" | "id" | "role">

export function issueSession(
  res: Response,
  user: SessionUser,
  secret: string,
): SessionUser {
  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: TOKEN_LIFETIME },
  )

  res.cookie("accessToken", token, {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none",
  })

  return user
}
