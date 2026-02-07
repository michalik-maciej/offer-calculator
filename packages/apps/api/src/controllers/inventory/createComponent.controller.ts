import { Request, Response } from "express"
import * as v from "valibot"
import { CreateComponentSchema } from "@schemas/inventory/ComponentCreate.schema"

import { createComponent } from "../../db/inventory.repository"

export async function createComponentController(req: Request, res: Response) {
  const parsed = v.safeParse(CreateComponentSchema, req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid component payload",
      issues: v.flatten(parsed.issues),
    })
  }

  const component = await createComponent(parsed.output)

  return res.status(201).json(component)
}
