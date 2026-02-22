import cors from "cors"
import type { Express } from "express"
import express from "express"

import healthRoutes from "./routes/health.routes"
import inventoryRoutes from "./routes/inventory.routes"
import offersRoutes from "./routes/offers.routes"

export const app: Express = express()

app.use(express.json())
app.use(cors())

app.use("/api/health", healthRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/offers", offersRoutes)
