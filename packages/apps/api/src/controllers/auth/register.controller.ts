import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import * as v from "valibot"

import { LoginInputSchema } from "@/schemas/auth/Login.schema"

import { createUser } from "../../db/user.repository"

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof LoginInputSchema>>
}

export async function registerController(
  req: Request,
  res: Response<ErrorResponse | void>,
) {
  const { success, output, issues } = v.safeParse(LoginInputSchema, req.body)

  if (!success) {
    return res
      .status(400)
      .json({ error: "Invalid request body", issues: v.flatten(issues) })
  }

  const { email, password } = output
  try {
    await createUser(email, await bcrypt.hash(password, 10))
  } catch (error) {
    console.error("Failed to create user:", error)
    return res.status(500).json({ error: "Failed to create user" })
  }
  res.sendStatus(201)
}
