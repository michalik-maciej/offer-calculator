import { Request, Response } from "express"

export function getUserController() {
  return (req: Request, res: Response) => {
    res.status(200).json({ user: req.user })
  }
}
