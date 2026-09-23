import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import * as v from "valibot"
import { Prisma } from "@prisma/client"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { UserPasswordUpdateSchema } from "@/schemas/user/UserPasswordUpdate.schema"

import { UserStore } from "../../db/user.repository"

export function setUserPasswordController({ users }: { users: UserStore }) {
  return async (req: Request, res: Response) => {
    const parsedParams = v.safeParse(IdParamSchema, req.params)

    if (!parsedParams.success) {
      return res.status(400).json({ error: "Invalid user ID" })
    }

    const parsedBody = v.safeParse(UserPasswordUpdateSchema, req.body)

    if (!parsedBody.success) {
      return res.status(400).json({
        error: "Invalid password payload",
        issues: v.flatten(parsedBody.issues),
      })
    }

    try {
      const passwordHash = await bcrypt.hash(parsedBody.output.password, 10)
      await users.updateUserPassword(parsedParams.output.id, passwordHash)
      return res.sendStatus(204)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "User not found" })
      }
      console.error("Setting user password failed:", error)
      return res.status(500).json({ error: "Setting user password failed" })
    }
  }
}
