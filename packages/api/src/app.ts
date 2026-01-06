import cors from "cors"
import express from "express"

import offersRoutes from "./routes/offers.routes"

export const app = express()

app.use(express.json())
app.use(cors())

app.use("/api/offers", offersRoutes)
app.get("/api/health", (_req, res) => {
  res.status(200).send("OK")
})
