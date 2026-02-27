import cookieParser from "cookie-parser"
import cors from "cors"
import type { Express } from "express"
import express from "express"

import authRoutes from "./routes/auth.routes"
import healthRoutes from "./routes/health.routes"
import inventoryRoutes from "./routes/inventory.routes"
import offersRoutes from "./routes/offers.routes"

export const app: Express = express()

app.use(express.json())
app.use(cookieParser())
app.use(cors({ credentials: true, origin: "http://localhost:5173" }))

app.use("/api/health", healthRoutes)
app.use("/api/auth", authRoutes)
app.use("/api/inventory", inventoryRoutes)
app.use("/api/offers", offersRoutes)
