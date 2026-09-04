import * as v from "valibot"

import { MissingComponent, OfferErrorSchema } from "@/schemas/OfferError.schema"

import { ApiError } from "../../core/createMethod.api"

const CATEGORY_LABELS: Record<string, string> = {
  back: "pleców",
  baseCover: "osłony dolnej",
  foot: "stopy",
  leg: "nogi",
  misc: "elementu",
  shelf: "półki",
  support: "wspornika",
}

const DIMENSION_LABELS = [
  ["width", "szer."],
  ["depth", "gł."],
  ["height", "wys."],
] as const

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

function describeMissingComponent(missing: MissingComponent): string {
  if (missing.id) {
    return `Brak w katalogu komponentu o identyfikatorze ${missing.id}`
  }

  const what = missing.category
    ? (CATEGORY_LABELS[missing.category] ?? "elementu")
    : "elementu"

  const dimensions = DIMENSION_LABELS.flatMap(([key, label]) => {
    const value = missing[key]
    return value == null ? [] : [`${label} ${value}`]
  }).join(", ")

  return dimensions
    ? `Brak w katalogu ${what} o wymiarach ${dimensions}`
    : `Brak w katalogu ${what}`
}

/**
 * Turns a failed preview request into a message for the user.
 *
 * A 422 from the offer endpoint carries the lookup that found nothing, which is
 * phrased here rather than in the API so that the wording stays in the front
 * end. Anything else falls back to a generic sentence.
 */
export function describePreviewError(error: unknown): string | null {
  if (!error) {
    return null
  }

  if (error instanceof ApiError && error.bodyText) {
    const parsed = v.safeParse(OfferErrorSchema, parseJson(error.bodyText))

    if (parsed.success && parsed.output.missingComponent) {
      return describeMissingComponent(parsed.output.missingComponent)
    }
  }

  return "Nie udało się przeliczyć oferty"
}
