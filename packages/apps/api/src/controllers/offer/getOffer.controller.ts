import { Request, Response } from "express"
import * as v from "valibot"
import { IdParamSchema } from "@schemas/IdParam.schema"

import { getOfferById } from "../../db/offer.repository"

export async function getOfferController(req: Request, res: Response) {
  const params = v.safeParse(IdParamSchema, req.params)

  if (!params.success) {
    return res.status(400).json({ error: "Invalid request" })
  }

  const offer = await getOfferById(params.output.id)
  res.status(200).json(offer)
}
