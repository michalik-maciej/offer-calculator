import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { requireAuth } from "../controllers/auth/requireAuth"
import {
  createCalculateOfferController,
  InventorySource,
} from "../controllers/offer/calculateOffer.controller"
import { createOfferController } from "../controllers/offer/createOffer.controller"
import { deleteOfferController } from "../controllers/offer/deleteOffer.controller"
import { getOfferController } from "../controllers/offer/getOffer.controller"
import { getOffersController } from "../controllers/offer/getOffers.controller"
import { updateOfferController } from "../controllers/offer/updateOffer.controller"

export function createOffersRouter({
  getInventory,
}: {
  getInventory: InventorySource
}): ExpressRouter {
  const router: ExpressRouter = Router()

  router.get("/", requireAuth, getOffersController)
  router.get("/:id", requireAuth, getOfferController)
  router.post("/", requireAuth, createOfferController)
  router.put("/:id", requireAuth, updateOfferController)
  router.delete("/:id", requireAuth, deleteOfferController)
  router.post(
    "/preview",
    requireAuth,
    createCalculateOfferController({ getInventory }),
  )

  return router
}
