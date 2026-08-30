import cookieParser from "cookie-parser"
import cors from "cors"
import type { Express } from "express"
import express from "express"

import { InventorySource } from "./controllers/offer/calculateOffer.controller"
import { getAllComponents } from "./db/inventory.repository"
import authRoutes from "./routes/auth.routes"
import healthRoutes from "./routes/health.routes"
import inventoryRoutes from "./routes/inventory.routes"
import { createOffersRouter } from "./routes/offers.routes"

type AppDependencies = {
  getInventory: InventorySource
}

/**
 * Builds the Express application with its middleware and routes.
 *
 * This is the composition root: the only place that decides where the offer
 * routes read the component inventory from.
 *
 * @param getInventory - Source of the component catalogue. Defaults to the
 * database repository; tests pass a fixture so the offer endpoint can be
 * exercised without a database.
 */
export function createApp({
  getInventory = getAllComponents,
}: Partial<AppDependencies> = {}): Express {
  const app: Express = express()

  app.use(express.json())
  app.use(cookieParser())
  app.use(cors({ credentials: true, origin: process.env.WEBAPP_DOMAIN }))

  app.use("/api/health", healthRoutes)
  app.use("/api/auth", authRoutes)
  app.use("/api/inventory", inventoryRoutes)
  app.use("/api/offers", createOffersRouter({ getInventory }))

  return app
}

export const app: Express = createApp()
