export type Component = {
  category: "back" | "baseCover" | "foot" | "leg" | "misc" | "shelf" | "support"
  depth: number | null
  height: number | null
  id: string
  label: string
  price: number
  width: number | null
}

export type ComponentDemand = { id: string; quantity: number }[]
