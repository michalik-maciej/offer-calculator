import { Router } from "express"

import { calculateOfferController } from "../controllers/calculateOffer.controller"

const router = Router()

router.post("/preview", calculateOfferController)
export default router
