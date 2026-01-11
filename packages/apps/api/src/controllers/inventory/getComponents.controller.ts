import { Request, Response } from "express"

import { getAllComponents } from "../../db/inventory.repository"

export async function getComponentsController(_: Request, res: Response) {
  const components = await getAllComponents()
  res.status(200).json(components)
}
