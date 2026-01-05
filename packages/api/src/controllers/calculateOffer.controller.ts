import { Request, Response } from "express"
import { safeParse } from "valibot"

import { calculateBomPrice } from "@/domain/calculations/calculateBomPrice/calculateBomPrice"
import { groupDemandByCategory } from "@/domain/helpers/groupDemandByCategory/groupDemandByCategory"
import { mapLayoutsToOfferOutput } from "@/domain/helpers/mapLayoutsToOfferOutput/mapLayoutsToOfferOutput"
import { calculateOfferDemand } from "@/domain/orchestrations/calculateOfferDemand/calculateOfferDemand"
import { OfferInputSchema, OfferOutput } from "@/schemas/Offer"

import { catalog } from "../catalog"

export function calculateOfferController(
  req: Request,
  res: Response<OfferOutput | { error: string; issues: unknown }>,
) {
  const { issues, output, success } = safeParse(OfferInputSchema, req.body)

  if (!success) {
    return res.status(400).json({
      error: "Invalid input",
      issues,
    })
  }

  const { discountPercentage, title } = output
  const bom = calculateOfferDemand(output.layouts, catalog)
  const { basePrice, discountPrice } = calculateBomPrice(
    { bom, discountPercentage },
    catalog,
  )
  const demandBreakdown = groupDemandByCategory(bom, catalog)
  const layouts = mapLayoutsToOfferOutput(output.layouts, catalog)

  res
    .status(200)
    .json({ basePrice, discountPrice, demandBreakdown, layouts, title })
}
