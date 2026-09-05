import { Request, Response } from "express"
import * as v from "valibot"
import { Prisma } from "@prisma/client"

import { IdParamSchema } from "@/schemas/IdParam.schema"
import { OfferInputSchema } from "@/schemas/Offer.schema"

import { priceOffer } from "./priceOffer"
import { getAllComponents } from "../../db/inventory.repository"
import { getOfferById, updateOffer } from "../../db/offer.repository"

export async function updateOfferController(req: Request, res: Response) {
  const params = v.safeParse(IdParamSchema, req.params)

  if (!params.success) {
    return res.status(400).json({ error: "Invalid request" })
  }

  const parsed = v.safeParse(OfferInputSchema, req.body)

  if (parsed.issues) {
    return res.status(400).json({
      error: "Invalid input",
      issues: v.flatten(parsed.issues),
    })
  }

  const existing = await getOfferById(params.output.id)
  if (!existing) {
    return res.status(404).json({ error: "Offer not found" })
  }

  try {
    const inventory = await getAllComponents()
    const { missingComponent, output } = priceOffer(parsed.output, inventory)
    const updated = await updateOffer({
      id: params.output.id,
      title: parsed.output.title,
      discountPercentage: parsed.output.discountPercentage,
      input: parsed.output,
      output: output ?? Prisma.DbNull,
    })

    return res.status(200).json({ ...updated, missingComponent })
  } catch (error) {
    console.error("Offer update failed:", error)
    return res.status(500).json({ error: "Offer update failed" })
  }
}
