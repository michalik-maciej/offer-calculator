import type { ComponentCategory } from "./component"

// Maps each wall layout dimension to the component category that governs valid values.
// Derived from calculation logic: calculateLegDemand (height), calculateFootDemand (depth),
// calculateBaseShelfDemand / calculateShelfDemand (width, shelf depth).
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
