import type { ComponentCategory } from "./inventory/Component.schema"

export const WALL_LAYOUT_CONSTRAINTS = {
  height: "leg",
  depth: "foot",
} as const satisfies Record<string, ComponentCategory>

export const SHELF_UNIT_CONSTRAINTS = {
  width: "shelf",
} as const satisfies Record<string, ComponentCategory>

export const SHELF_CONSTRAINTS = {
  depth: "shelf",
} as const satisfies Record<string, ComponentCategory>
