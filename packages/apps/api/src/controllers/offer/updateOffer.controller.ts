import { Request, Response } from "express"
import * as v from "valibot"
import { createOfferPreview } from "@domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferInputSchema } from "@schemas/Offer.schema"

import { getAllComponents } from "../../db/inventory.repository"
import { getOfferById, updateOffer } from "../../db/offer.repository"

export async function updateOfferController(
  req: Request<{ offerId: string }>,
  res: Response,
) {
  const { offerId } = req.params
  const parsed = v.safeParse(OfferInputSchema, req.body)

  if (parsed.issues) {
    return res.status(400).json({
      error: "Invalid input",
      issues: v.flatten(parsed.issues),
    })
  }

  const existing = await getOfferById(offerId)
  if (!existing) {
    return res.status(404).json({ error: "Offer not found" })
  }

  try {
    const inventory = await getAllComponents()
    const updated = await updateOffer({
      id: offerId,
      title: parsed.output.title,
      discountPercentage: parsed.output.discountPercentage,
      input: parsed.output,
      output: createOfferPreview(parsed.output, inventory),
    })

    return res.status(200).json(updated)
  } catch {
    return res.status(500).json({ error: "Offer update failed" })
  }
}
