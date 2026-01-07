import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"

export function deleteComponentController(req: Request, res: Response) {
  const parsed = v.safeParse(IdParamSchema, req.params)

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid component ID" })
  }

  res.status(204)
}
