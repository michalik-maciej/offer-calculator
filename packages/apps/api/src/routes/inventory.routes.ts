import { Router } from "express"

import { createComponentController } from "../controllers/inventory/createComponent.controller"
import { deleteComponentController } from "../controllers/inventory/deleteComponent.controller"
import { getComponentsController } from "../controllers/inventory/getComponents.controller"
import { updateComponentController } from "../controllers/inventory/updateComponent.controller"

const router = Router()

router.get("/components", getComponentsController)

router.post("/components", createComponentController)
router.put("/components/:id", updateComponentController)
router.delete("/components/:id", deleteComponentController)

export default router
