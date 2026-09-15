import type { ComponentCategory } from "@/schemas/inventory/Component.schema"

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
