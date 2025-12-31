import { find } from "lodash/fp"

import { Component } from "@/schemas/Component"

type DemandByCategory = Record<
  Component["category"],
  Array<{ id: string; quantity: number; label: string }>
>

export function groupDemandByCategory(
  rawDemand: { id: string; quantity: number }[],
  catalog: Component[],
): Partial<DemandByCategory> {
  const result: Partial<DemandByCategory> = {}

  for (const { id, quantity } of rawDemand) {
    const component = find({ id }, catalog)
    if (!component) {
      throw new Error(`Component with id ${id} not found in catalog`)
    }

    const bucket = result[component.category] ?? []
    const existing = find({ id }, bucket)

    if (existing) {
      existing.quantity += quantity
    } else {
      bucket.push({
        id,
        quantity,
        label: component.label,
      })
    }

    result[component.category] = bucket
  }

  return result
}
