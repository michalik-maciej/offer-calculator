import { Request, Response } from "express"
import * as v from "valibot"
import { Prisma } from "@prisma/client"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { UpdateComponentSchema } from "@/schemas/inventory/ComponentUpdate.schema"

import { ComponentStore } from "../../db/inventory.repository"

export function updateComponentController({
  updateComponent,
}: Pick<ComponentStore, "updateComponent">) {
  return async (req: Request, res: Response) => {
    const params = v.safeParse(IdParamSchema, req.params)

    if (!params.success) {
      return res.status(400).json({ error: "Invalid component ID" })
    }

    const body = v.safeParse(UpdateComponentSchema, req.body)

    if (!body.success) {
      return res.status(400).json({
        error: "Invalid component payload",
        issues: v.flatten(body.issues),
      })
    }

    try {
      const updated = await updateComponent({
        ...body.output,
        id: params.output.id,
      })

      return res.status(200).json(updated)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "Component not found" })
      }
      console.error("Component update failed:", error)
      return res.status(500).json({ error: "Component update failed" })
    }
  }
}
