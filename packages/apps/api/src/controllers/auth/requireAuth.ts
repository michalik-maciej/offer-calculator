import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import * as v from "valibot"

import { JwtPayload, JwtPayloadSchema } from "@/schemas/auth/JwtPayload.schema"

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: JwtPayload
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error("Missing JWT_SECRET")
    return res.status(500).json({ error: "Server misconfigured" })
  }

  const token = req.cookies?.accessToken
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" })
  }

  try {
    req.user = v.parse(JwtPayloadSchema, jwt.verify(token, secret))
    next()
  } catch {
    return res.status(401).json({ error: "Invalid token" })
  }
}
