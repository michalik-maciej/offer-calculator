import { Router } from "express"

import { createComponentController } from "../controllers/inventory/createComponent.controller"
import { deleteComponentController } from "../controllers/inventory/deleteComponent.controller"
import { getComponentController } from "../controllers/inventory/getComponent.controller"
import {
  getComponentsController,
  getComponentsGroupedController,
} from "../controllers/inventory/getComponents.controller"
import { updateComponentController } from "../controllers/inventory/updateComponent.controller"

const router = Router()

router.get("/items", getComponentsController)
router.get("/items/grouped", getComponentsGroupedController)
router.get("/items/:id", getComponentController)

router.post("/items", createComponentController)
router.put("/items/:id", updateComponentController)
router.delete("/items/:id", deleteComponentController)

export default router
