import express from "express"

import { calculateOfferController } from "./controllers/calculateOffer.controller"

export const app = express()

app.use(express.json())

app.post("/api/calculate/offer", calculateOfferController)
app.get("/api/health", (_req, res) => {
  res.status(200).send("OK")
})
