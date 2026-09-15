import { NextFunction, Request, Response } from "express"
import { Role } from "@prisma/client"

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== Role.ADMIN) {
    return res.status(403).json({ error: "Forbidden" })
  }

  next()
}
