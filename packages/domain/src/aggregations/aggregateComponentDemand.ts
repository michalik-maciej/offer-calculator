type ComponentDemand = {
  id: string
  quantity: number
}

export function aggregateComponentDemand(
  rawDemand: ComponentDemand[],
): ComponentDemand[] {
  const map = new Map<string, ComponentDemand>()
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
