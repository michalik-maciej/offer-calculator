import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { loginController } from "../controllers/auth/login.controller"

const router: ExpressRouter = Router()

router.post("/login", loginController)

export default router
