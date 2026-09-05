import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { deleteOffer, getOfferById } from "../../db/offer.repository"

export async function deleteOfferController(req: Request, res: Response) {
  const params = v.safeParse(IdParamSchema, req.params)

  if (!params.success) {
    return res.status(400).json({ error: "Invalid request" })
  }

  const existing = await getOfferById(params.output.id)
  if (!existing) {
    return res.status(404).json({ error: "Offer not found" })
  }

  try {
    await deleteOffer(params.output.id)
    return res.sendStatus(204)
  } catch (error) {
    console.error("Offer deletion failed:", error)
    return res.status(500).json({ error: "Offer deletion failed" })
  }
}
