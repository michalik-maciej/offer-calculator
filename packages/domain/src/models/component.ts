export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number]

export type Component = {
  category: ComponentCategory
  depth: number | null
  height: number | null
  id: string
  label: string
  price: number
  width: number | null
}

export type ComponentDemand = { id: string; quantity: number }[]

export const COMPONENT_CATEGORIES = [
  "back",
  "baseCover",
  "foot",
  "leg",
  "misc",
  "shelf",
  "support",
] as const

export const CATEGORY_REQUIREMENTS: Record<
  ComponentCategory,
  { required: ("width" | "height" | "depth")[] }
> = {
  back: { required: ["width", "height"] },
  baseCover: { required: ["width"] },
  foot: { required: ["depth"] },
  leg: { required: ["width", "height", "depth"] },
  misc: { required: [] },
  shelf: { required: ["width", "depth"] },
  support: { required: ["depth"] },
}
