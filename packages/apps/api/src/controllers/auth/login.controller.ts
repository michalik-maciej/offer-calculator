import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import jwt from "jsonwebtoken"
import * as v from "valibot"

import { LoginInputSchema } from "@/schemas/auth/Login.schema"

import { getUserByEmail } from "../../db/user.repository"

type LoginResponse = {
  user: {
    id: string
    email: string
    role: string
  }
}

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof LoginInputSchema>>
}

export async function loginController(
  req: Request,
  res: Response<LoginResponse | ErrorResponse>,
) {
  const { issues, output, success } = v.safeParse(LoginInputSchema, req.body)

  if (!success) {
    return res.status(400).json({
      error: "Invalid login payload",
      issues: v.flatten(issues),
    })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ error: "Server misconfigured" })
  }

  const user = await getUserByEmail(output.email)
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const hasPasswordMatch = await bcrypt.compare(output.password, user.password)

  if (!hasPasswordMatch) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn: "7d" },
  )

  res.cookie("accessToken", token, {
    httpOnly: true,
    domain: "offer-calculator-api.fly.dev",
    path: "/",
    secure: true,
    sameSite: "none",
  })

  return res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  })
}
