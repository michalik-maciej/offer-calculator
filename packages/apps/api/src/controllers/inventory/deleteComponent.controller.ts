import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { deleteComponent } from "../../db/inventory.repository"

export async function deleteComponentController(req: Request, res: Response) {
  const parsed = v.safeParse(IdParamSchema, req.params)

  if (!parsed.success) {
    return res.status(400).json({ error: "Invalid component ID" })
  }

  await deleteComponent(parsed.output.id)
  return res.sendStatus(204)
}
