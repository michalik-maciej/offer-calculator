import { RequestHandler } from "express"
import * as v from "valibot"

import { Component } from "@/domain/models/component"
import { createOfferPreview } from "@/domain/orchestrations/createOfferPreview/createOfferPreview"
import { OfferInputSchema, OfferOutput } from "@/schemas/Offer.schema"

export type InventorySource = () => Promise<Component[]>

type ErrorResponse = {
  error: string
  issues?: ReturnType<typeof v.flatten<typeof OfferInputSchema>>
}

/**
 * Builds the handler for `POST /api/offers/preview`, which validates an offer
 * input and prices it against the component inventory.
 *
 * The inventory is injected rather than read here, which keeps the endpoint a
 * pure computation and lets it be tested without a database.
 *
 * @param getInventory - Source of the component catalogue.
 * @returns An Express handler answering 200 with the priced offer, 400 for an
 * input the schema rejects, and 500 when the calculation itself throws.
 */
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
    } catch {
      return res.status(500).json({ error: "Calculation failed" })
    }
  }
}
