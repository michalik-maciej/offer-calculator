import { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"

function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("Missing JWT_SECRET")
  }
  return jwt.verify(token, secret)
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.accessToken
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  try {
    const payload = verifyToken(token)
    // @ts-expect-error attach the user info to the request object
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ message: "Invalid token" })
  }
}
