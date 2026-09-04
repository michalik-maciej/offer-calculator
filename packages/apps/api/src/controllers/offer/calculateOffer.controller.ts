import { RequestHandler } from "express"
import * as v from "valibot"

import { Component } from "@/domain/models/component"
import { isMissingComponentError } from "@/domain/models/missingComponentError"
import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferInputSchema, OfferOutput } from "@/schemas/Offer.schema"
import { MissingComponent } from "@/schemas/OfferError.schema"

export type InventorySource = () => Promise<Component[]>

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof OfferInputSchema>>
  missingComponent?: MissingComponent
}

export function createCalculateOfferController({
  getInventory,
}: {
  getInventory: InventorySource
}): RequestHandler<unknown, OfferOutput | ErrorResponse> {
  return async (req, res) => {
    const parsed = v.safeParse(OfferInputSchema, req.body)

    if (parsed.issues) {
      return res.status(400).json({
        error: "Invalid input",
        issues: v.flatten<typeof OfferInputSchema>(parsed.issues),
      })
    }

    try {
      const inventory = await getInventory()
      const result = createOfferPreview(parsed.output, inventory)
      return res.status(200).json(result)
    } catch (error) {
      if (isMissingComponentError(error)) {
        return res
          .status(422)
          .json({ error: error.message, missingComponent: error.query })
      }

      console.error("Offer preview failed:", error)
      return res.status(500).json({ error: "Calculation failed" })
    }
  }
}
