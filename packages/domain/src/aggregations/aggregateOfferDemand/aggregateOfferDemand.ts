import { compact } from "lodash/fp"

import { Component } from "@/schemas/Component"
import { isLayoutGondola } from "@/schemas/LayoutGondola"
import { isLayoutWall } from "@/schemas/LayoutWall"
import { OfferInput } from "@/schemas/Offer"

import { aggregateGondolaDemand } from "../aggregateGondolaDemand/aggregateGondolaDemand"
import { aggregateWallDemand } from "../aggregateWallDemand/aggregateWallDemand"

export const aggregateOfferDemand = (
  layouts: OfferInput["layouts"],
  catalog: Component[],
) => {
  const rawDemand = compact(
    layouts.flatMap((layout) => {
      switch (true) {
        case isLayoutWall(layout):
          return aggregateWallDemand(layout, catalog)
        case isLayoutGondola(layout):
          return aggregateGondolaDemand(layout, catalog)
      }
    }),
  )

  const map = new Map<string, { id: string; quantity: number }>()
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
