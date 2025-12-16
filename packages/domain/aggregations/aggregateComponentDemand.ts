import type { ComponentDemand } from "../shelf-unit/calculateShelfUnitDemand.js"

export function aggregateComponentDemand(
  lines: ComponentDemand[]
): ComponentDemand[] {
  const byId = new Map<string, ComponentDemand>()

  for (const line of lines) {
    const key = line.component.id
    const existing = byId.get(key)

    if (!existing) {
      byId.set(key, { component: line.component, quantity: line.quantity })
      continue
    }

    byId.set(key, {
      component: existing.component,
      quantity: existing.quantity + line.quantity,
    })
  }

  return [...byId.values()]
}
