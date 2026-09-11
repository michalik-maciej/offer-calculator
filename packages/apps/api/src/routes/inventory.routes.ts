import type { Router as ExpressRouter } from "express"
import { Router } from "express"

import { withAuth } from "./withAuth"
import { createComponentController } from "../controllers/inventory/createComponent.controller"
import { deleteComponentController } from "../controllers/inventory/deleteComponent.controller"
import { getComponentsController } from "../controllers/inventory/getComponents.controller"
import { updateComponentController } from "../controllers/inventory/updateComponent.controller"

const router: ExpressRouter = Router()
const guarded = withAuth(router)

guarded.get("/items", getComponentsController)
guarded.post("/items", createComponentController)
guarded.put("/items/:id", updateComponentController)
guarded.delete("/items/:id", deleteComponentController)

export default router
