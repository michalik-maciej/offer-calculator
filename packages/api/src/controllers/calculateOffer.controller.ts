import { Request, Response } from "express"
import * as v from "valibot"

import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferInputSchema, OfferOutput } from "@/schemas/Offer.schema"

import { inventory } from "../inventory"

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof OfferInputSchema>>
}

export function calculateOfferController(
  req: Request,
  res: Response<OfferOutput | ErrorResponse>,
) {
  const parsed = v.safeParse(OfferInputSchema, req.body)

  if (parsed.issues) {
    return res.status(400).json({
      error: "Invalid input",
      issues: v.flatten<typeof OfferInputSchema>(parsed.issues),
    })
  }

  try {
    const result = createOfferPreview(parsed.output, inventory)
    return res.status(200).json(result)
  } catch {
    return res.status(500).json({ error: "Calculation failed" })
  }
}
