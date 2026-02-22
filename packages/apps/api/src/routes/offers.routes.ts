import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { calculateOfferController } from "../controllers/offer/calculateOffer.controller"
import { createOfferController } from "../controllers/offer/createOffer.controller"
import { getOfferController } from "../controllers/offer/getOffer.controller"
import { getOffersController } from "../controllers/offer/getOffers.controller"
import { updateOfferController } from "../controllers/offer/updateOffer.controller"

const router: ExpressRouter = Router()

router.get("/", getOffersController)
router.get("/:id", getOfferController)
router.post("/", createOfferController)
router.put("/:id", updateOfferController)
router.post("/preview", calculateOfferController)

export default router
