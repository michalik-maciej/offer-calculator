import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { withAuth } from "./withAuth"
import { requireAdmin } from "../controllers/auth/requireAdmin"
import { deleteUserController } from "../controllers/users/deleteUser.controller"
import { listUsersController } from "../controllers/users/listUsers.controller"
import { setUserPasswordController } from "../controllers/users/setUserPassword.controller"
import { UserStore } from "../db/user.repository"

export function createUsersRouter({
  users,
}: {
  users: UserStore
}): ExpressRouter {
  const router: ExpressRouter = Router()
  const guarded = withAuth(router)

  guarded.get("/", requireAdmin, listUsersController({ users }))
  guarded.delete("/:id", requireAdmin, deleteUserController({ users }))
  guarded.put(
    "/:id/password",
    requireAdmin,
    setUserPasswordController({ users }),
  )

  return router
}
