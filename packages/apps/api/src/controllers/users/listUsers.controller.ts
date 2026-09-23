import { Request, Response } from "express"

import { UserStore } from "../../db/user.repository"

export function listUsersController({ users }: { users: UserStore }) {
  return async (_req: Request, res: Response) => {
    try {
      const list = await users.listUsers()

      return res.status(200).json(list)
    } catch (error) {
      console.error("Listing users failed:", error)
      return res.status(500).json({ error: "Listing users failed" })
    }
  }
}
