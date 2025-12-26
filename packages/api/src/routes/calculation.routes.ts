import { Router } from "express"

import { calculateLinearWallController } from "../controllers/calculateLinearWall.controller"

const router = Router()

router.post("/linear-wall", calculateLinearWallController)

export default router
