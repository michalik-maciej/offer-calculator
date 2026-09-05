import type { ComponentCategory } from "@/domain/models/component"

export const CATEGORY_LABELS: Record<ComponentCategory, string> = {
  back: "Plecy",
  baseCover: "Osłony dolne",
  foot: "Stopy",
  leg: "Nogi",
  misc: "Inne",
  shelf: "Półki",
  support: "Wsporniki",
}

export const CATEGORY_LABELS_GENITIVE: Record<string, string> = {
  back: "pleców",
  baseCover: "osłony dolnej",
  foot: "stopy",
  leg: "nogi",
  misc: "elementu",
  shelf: "półki",
  support: "wspornika",
}
