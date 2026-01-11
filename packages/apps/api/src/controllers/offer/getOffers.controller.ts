import { Request, Response } from "express"

import { getAllOffers } from "../../db/offer.repository"

export async function getOffersController(_: Request, res: Response) {
  const offers = await getAllOffers()
  res.status(200).json(offers)
}
