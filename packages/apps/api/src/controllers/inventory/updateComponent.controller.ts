import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { UpdateComponentSchema } from "@/schemas/inventory/ComponentUpdate.schema"

import { updateComponent } from "../../db/inventory.repository"

export async function updateComponentController(req: Request, res: Response) {
  const body = v.safeParse(UpdateComponentSchema, req.body)
  const params = v.safeParse(IdParamSchema, req.params)

  if (!body.success || !params.success) {
    return res.status(400).json({ error: "Invalid request" })
  }

  const updated = await updateComponent({
    ...body.output,
    id: params.output.id,
  })
  return res.status(200).json(updated)
}
