import { Request, Response } from "express"

import { getComponentById } from "../../db/inventory.repository"

export async function getComponentController(req: Request, res: Response) {
  const component = await getComponentById(req.params.id)
  res.status(200).json(component)
}
