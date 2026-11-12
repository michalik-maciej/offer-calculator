import { Request, Response } from "express"
import * as v from "valibot"
import { Prisma } from "@prisma/client"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { ComponentStore } from "../../db/inventory.repository"

export function deleteComponentController({
  deleteComponent,
}: Pick<ComponentStore, "deleteComponent">) {
  return async (req: Request, res: Response) => {
    const parsed = v.safeParse(IdParamSchema, req.params)

    if (!parsed.success) {
      return res.status(400).json({ error: "Invalid component ID" })
    }

    try {
      await deleteComponent(parsed.output.id)
      return res.sendStatus(204)
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return res.status(404).json({ error: "Component not found" })
      }
      console.error("Component deletion failed:", error)
      return res.status(500).json({ error: "Component deletion failed" })
    }
  }
}
