import { find } from "lodash/fp"

import { Component, ComponentDemand } from "../../models/component"

type DemandByCategory = Partial<
  Record<
    Component["category"],
    Array<ComponentDemand[number] & { label: string }>
  >
>

export function groupDemandByCategory(
  rawDemand: ComponentDemand,
  catalog: Component[],
) {
  const bom: DemandByCategory = {}

  for (const { id, quantity } of rawDemand) {
    const component = find({ id }, catalog)
    if (!component) {
      throw new Error(`Component with id "${id}" not found in catalog`)
    }

    const bucket = bom[component.category] ?? []
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

    bom[component.category] = bucket
  }

  return bom
}
