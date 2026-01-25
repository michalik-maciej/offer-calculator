import { Request, Response } from "express"

import { getAllComponents } from "../../db/inventory.repository"

export async function getComponentsController(_: Request, res: Response) {
  const components = await getAllComponents()
  res.status(200).json(components)
}

export async function getComponentsGroupedController(
  _: Request,
  res: Response,
) {
  const components = await getAllComponents()

  const grouped = components.reduce<Record<string, typeof components>>(
    (acc, component) => {
      acc[component.category] ??= []
      acc[component.category].push(component)
      return acc
    },
    {},
  )

  res.status(200).json(
    Object.entries(grouped).map(([category, items]) => ({
      category,
      items,
    })),
  )
}
