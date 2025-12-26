import express from "express"

import calculationRoutes from "./routes/calculation.routes.js"

export const app = express()

app.use(express.json())

app.use("/api/calculate", calculationRoutes)
app.get("/api/health", (_req, res) => {
  res.status(200).send("OK")
})
