import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { loginController } from "../controllers/auth/login.controller"
import { logoutController } from "../controllers/auth/logout.controller"
import { registerController } from "../controllers/auth/register.controller"
import { requireAuth } from "../controllers/auth/requireAuth"

const router: ExpressRouter = Router()

router.post("/login", loginController)
router.post("/logout", requireAuth, logoutController)
router.post("/register", registerController)

export default router
