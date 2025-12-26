import { Request, Response } from "express"

import { calculateLinearWallDemand } from "@/domain/aggregations/calculateLinearWallDemand"
import { parseLinearWallLayout } from "@/schemas/layouts/LinearWallLayout"

import { catalog } from "../catalog"

export function calculateLinearWallController(req: Request, res: Response) {
  try {
    const input = parseLinearWallLayout(req.body)
    const bom = calculateLinearWallDemand(input, catalog)

    res.status(200).json({ bom })
  } catch (error) {
    res.status(400).json({ message: (error as Error).message })
  }
}
