import { Request, Response } from "express"
import * as v from "valibot"

import { OfferInputSchema } from "@/schemas/Offer.schema"

import { priceOffer } from "./priceOffer"
import { getAllComponents } from "../../db/inventory.repository"
import { createOffer } from "../../db/offer.repository"

export async function createOfferController(req: Request, res: Response) {
  const parsed = v.safeParse(OfferInputSchema, req.body)

  if (parsed.issues) {
    return res.status(400).json({
      error: "Invalid input",
      issues: v.flatten(parsed.issues),
    })
  }

  try {
    const inventory = await getAllComponents()
    const { missingComponent, output } = priceOffer(parsed.output, inventory)
    const offer = await createOffer({
      title: parsed.output.title,
      discountPercentage: parsed.output.discountPercentage,
      input: parsed.output,
      output: output ?? undefined,
    })

    return res.status(201).json({ ...offer, missingComponent })
  } catch (error) {
    console.error("Offer creation failed:", error)
    return res.status(500).json({ error: "Offer creation failed" })
  }
}
