import { Request, Response } from "express"

import { toOfferScope } from "./toOfferScope"
import { OfferStore } from "../../db/offer.repository"

export function getOffersController({
  getAllOffers,
}: Pick<OfferStore, "getAllOffers">) {
  return async (req: Request, res: Response) => {
    const scope = toOfferScope(req.user)

    if (!scope) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    try {
      const offers = await getAllOffers(scope)

      return res.status(200).json(offers)
    } catch (error) {
      console.error("Reading the offers failed:", error)
      return res.status(500).json({ error: "Reading the offers failed" })
    }
  }
}
