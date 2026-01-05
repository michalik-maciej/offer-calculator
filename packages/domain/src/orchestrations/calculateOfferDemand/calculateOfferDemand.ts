import { compact } from "lodash/fp"

import { isLayoutGondola } from "@/schemas/LayoutGondola"
import { isLayoutWall } from "@/schemas/LayoutWall"
import { OfferInput } from "@/schemas/Offer"

import { Component, ComponentDemand } from "../../types"
import { calculateGondolaLayoutDemand } from "../calculateGondolaLayoutDemand/calculateGondolaLayoutDemand"
import { calculateWallLayoutDemand } from "../calculateWallLayoutDemand/calculateWallLayoutDemand"

export const calculateOfferDemand = (
  layouts: OfferInput["layouts"],
  catalog: Component[],
) => {
  const rawDemand = compact(
    layouts.flatMap((layout) => {
      switch (true) {
        case isLayoutWall(layout):
          return calculateWallLayoutDemand(layout, catalog)
        case isLayoutGondola(layout):
          return calculateGondolaLayoutDemand(layout, catalog)
      }
    }),
  )

  const map = new Map<string, ComponentDemand[number]>()
  for (const item of rawDemand) {
    const existing = map.get(item.id)

    if (!existing) {
      map.set(item.id, { ...item })
      continue
    }

    map.set(item.id, {
      ...existing,
      quantity: existing.quantity + item.quantity,
    })
  }

  return Array.from(map.values())
}
