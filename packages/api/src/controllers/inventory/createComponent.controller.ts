import { randomUUID } from "crypto"
import { Request, Response } from "express"
import * as v from "valibot"

import { Component } from "@/domain/models/Component"
import { CreateComponentSchema } from "@/schemas/inventory/ComponentCreate.schema"

import { inventory } from "../../inventory"

export function createComponentController(req: Request, res: Response) {
  const parsed = v.safeParse(CreateComponentSchema, req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid component payload",
      issues: v.flatten(parsed.issues),
    })
  }

  const component: Component = {
    id: randomUUID(),
    ...parsed.output,
  }

  inventory.push(component)

  return res.status(201).json(component)
}
