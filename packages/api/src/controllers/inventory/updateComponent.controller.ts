import { Request, Response } from "express"
import * as v from "valibot"

import { Component } from "@/domain/models/Component"
import { IdParamSchema } from "@/schemas/IdParam.schema"
import { UpdateComponentSchema } from "@/schemas/inventory/ComponentUpdate.schema"

import { inventory } from "../../inventory"

export function updateComponentController(req: Request, res: Response) {
  const body = v.safeParse(UpdateComponentSchema, req.body)
  const params = v.safeParse(IdParamSchema, req.params)

  if (!body.success || !params.success) {
    return res.status(400).json({ error: "Invalid request" })
  }

  const index = inventory.findIndex(({ id }) => id === params.output.id)
  const existing = inventory[index]

  if (!existing) {
    return res.status(404).json({ error: "Component not found" })
  }

  const updated: Component = {
    ...existing,
    ...body.output,
    id: params.output.id,
  }

  inventory[index] = updated
  return res.status(200).json(updated)
}
