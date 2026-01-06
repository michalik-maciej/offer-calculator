import { Request, Response } from "express"
import { safeParse } from "valibot"

import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferInputSchema, OfferOutput } from "@/schemas/Offer.schema"

import { catalog } from "../catalog"

export function calculateOfferController(
  req: Request,
  res: Response<OfferOutput | { error: string; issues: unknown }>,
) {
  const parsed = safeParse(OfferInputSchema, req.body)

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid input",
      issues: parsed.issues,
    })
  }

  const result = createOfferPreview(parsed.output, catalog)
  return res.status(200).json(result)
}
