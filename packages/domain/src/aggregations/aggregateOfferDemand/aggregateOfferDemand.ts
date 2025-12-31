import { Component } from "@/schemas/Component"
import { OfferInput } from "@/schemas/Offer"

import { aggregateLinearWallDemand } from "../aggregateLinearWallDemand/aggregateLinearWallDemand"

export const aggregateOfferDemand = (
  layouts: OfferInput["layouts"],
  catalog: Component[],
) => {
  const rawDemand = layouts.flatMap((layout) =>
    aggregateLinearWallDemand(layout, catalog),
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
