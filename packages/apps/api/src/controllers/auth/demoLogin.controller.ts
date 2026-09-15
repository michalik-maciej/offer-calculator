import bcrypt from "bcryptjs"
import { Request, Response } from "express"
import { randomUUID } from "node:crypto"
import { Role } from "@prisma/client"

import { issueSession } from "./issueSession"
import { UserStore } from "../../db/user.repository"

const DEMO_EMAIL = "demo@projektownia.app"
const PASSWORD_SALT_ROUNDS = 10

export function demoLoginController({
  createUser,
  getUserByEmail,
}: Pick<UserStore, "createUser" | "getUserByEmail">) {
  return async (_req: Request, res: Response) => {
    const secret = process.env.JWT_SECRET

    if (!secret) {
      console.error("Missing JWT_SECRET")
      return res.status(500).json({ error: "Server misconfigured" })
    }

    try {
      const existing = await getUserByEmail(DEMO_EMAIL)
      const user =
        existing ??
        (await createUser(
          DEMO_EMAIL,
          await bcrypt.hash(randomUUID(), PASSWORD_SALT_ROUNDS),
          Role.DEMO,
        ))

      return res.status(200).json({
        user: issueSession(
          res,
          { email: user.email, id: user.id, role: user.role },
          secret,
        ),
      })
    } catch (error) {
      console.error("Demo sign-in failed:", error)
      return res.status(500).json({ error: "Demo sign-in failed" })
    }
  }
}
