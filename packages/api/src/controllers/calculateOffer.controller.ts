import { Request, Response } from "express"
import { safeParse } from "valibot"

import { aggregateOfferDemand } from "@/domain/aggregations/aggregateOfferDemand/aggregateOfferDemand"
import { aggregateOfferPrice } from "@/domain/aggregations/aggregateOfferPrice/aggregateOfferPrice"
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
  const bom = aggregateOfferDemand(layouts, catalog)
  const { basePrice, discountPrice } = aggregateOfferPrice({
    bom,
    discountPercentage,
    catalog,
  })

  res.status(200).json({ bom, basePrice, discountPrice })
}
