import type { Router as ExpressRouter } from "express"
import { Router } from "express"
import { get } from "lodash/fp"

import { createLoginRateLimit } from "./loginRateLimit"
import { withAuth } from "./withAuth"
import { loginController } from "../controllers/auth/login.controller"
import { logoutController } from "../controllers/auth/logout.controller"
import { registerController } from "../controllers/auth/register.controller"

export function createAuthRouter(): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)

  guarded.get("/user", (req, res) => {
    res.json({ user: get("user", req) })
  })
  router.post("/login", createLoginRateLimit(), loginController)
  guarded.post("/logout", logoutController)
  router.post("/register", registerController)

  return router
}
