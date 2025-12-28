import { Request, Response } from "express"
import { safeParse } from "valibot"

import { calculateOfferDemand } from "@/domain/aggregations/calculateOfferDemand"
import { calculateOfferPrice } from "@/domain/aggregations/calculateOfferPrice"
import { OfferInputSchema } from "@/schemas/Offer"

import { catalog } from "../catalog"

export function calculateOfferController(req: Request, res: Response) {
  const { issues, output, success } = safeParse(OfferInputSchema, req.body)

  if (!success) {
    return res.status(400).json({
      error: "Invalid input",
      issues,
    })
  }
  const { layouts, discountPercentage } = output
  const bom = calculateOfferDemand(layouts, catalog)
  const { basePrice, discountPrice } = calculateOfferPrice({
    bom,
    discountPercentage,
    catalog,
  })

  res.status(200).json({ bom, basePrice, discountPrice })
}
