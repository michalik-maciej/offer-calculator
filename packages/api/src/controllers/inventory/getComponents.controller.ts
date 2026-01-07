import { Request, Response } from "express"

import { inventory } from "../../inventory"

export function getComponentsController(_: Request, res: Response) {
  res.status(200).json(inventory)
}
