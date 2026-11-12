import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { createDemoRateLimit } from "./demoRateLimit"
import { createLoginRateLimit } from "./loginRateLimit"
import { withAuth } from "./withAuth"
import { demoLoginController } from "../controllers/auth/demoLogin.controller"
import { getUserController } from "../controllers/auth/getUser.controller"
import { loginController } from "../controllers/auth/login.controller"
import { logoutController } from "../controllers/auth/logout.controller"
import { registerController } from "../controllers/auth/register.controller"
import { requireAdmin } from "../controllers/auth/requireAdmin"
import { OfferStore } from "../db/offer.repository"
import { UserStore } from "../db/user.repository"

export function createAuthRouter({
  offers,
  users,
}: {
  offers: Pick<OfferStore, "createOffer">
  users: UserStore
}): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)

  guarded.get("/user", getUserController())
  router.post("/login", createLoginRateLimit(), loginController(users))
  router.post(
    "/demo",
    createDemoRateLimit(),
    demoLoginController({ ...users, ...offers }),
  )
  guarded.post("/logout", logoutController())
  guarded.post("/register", requireAdmin, registerController(users))

  return router
}
