import { Request, Response } from "express"
import * as v from "valibot"

import { IdParamSchema } from "@/schemas/IdParam.schema"

import { toOfferScope } from "./toOfferScope"
import { OfferStore } from "../../db/offer.repository"

export function getOfferController({
  getOfferById,
}: Pick<OfferStore, "getOfferById">) {
  return async (req: Request, res: Response) => {
    const params = v.safeParse(IdParamSchema, req.params)

    if (!params.success) {
      return res.status(400).json({ error: "Invalid request" })
    }

    const scope = toOfferScope(req.user)

    if (!scope) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const offer = await getOfferById(params.output.id, scope)

    if (!offer) {
      return res.status(404).json({ error: "Offer not found" })
    }

    return res.status(200).json(offer)
  }
}
