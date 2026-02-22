import type { Router as ExpressRouter } from "express"
import { Router } from "express"

const router: ExpressRouter = Router()

router.get("/", (_req, res) => {
  res.status(200).send("OK")
})

export default router
