import { Request, Response } from "express"
import * as v from "valibot"
import { Prisma } from "@prisma/client"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { UserStore } from "../../db/user.repository"

export function deleteUserController({ users }: { users: UserStore }) {
  return async (req: Request, res: Response) => {
    const parsed = v.safeParse(IdParamSchema, req.params)

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid user ID" })
    }

    if (req.user?.sub === parsed.output.id) {
      return res.status(400).json({ error: "Cannot delete your own account" })
    }

    try {
      await users.deleteUser(parsed.output.id)
      return res.sendStatus(204)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return res.status(404).json({ error: "User not found" })
        }
        if (error.code === "P2003") {
          return res.status(409).json({ error: "User has existing offers" })
        }
      }
      console.error("User deletion failed:", error)
      return res.status(500).json({ error: "User deletion failed" })
    }
  }
}
