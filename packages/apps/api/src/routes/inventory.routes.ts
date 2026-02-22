import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { requireAuth } from "../controllers/auth/requireAuth"
import { createComponentController } from "../controllers/inventory/createComponent.controller"
import { deleteComponentController } from "../controllers/inventory/deleteComponent.controller"
import { getComponentsController } from "../controllers/inventory/getComponents.controller"
import { updateComponentController } from "../controllers/inventory/updateComponent.controller"

const router: ExpressRouter = Router()

router.get("/items", requireAuth, getComponentsController)
router.post("/items", requireAuth, createComponentController)
router.put("/items/:id", requireAuth, updateComponentController)
router.delete("/items/:id", requireAuth, deleteComponentController)

export default router
