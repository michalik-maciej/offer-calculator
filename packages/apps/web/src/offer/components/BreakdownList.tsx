import { Fragment } from "react"

import { COMPONENT_CATEGORIES } from "@/domain/models/component"
import { OfferOutput } from "@/schemas/Offer.schema"

import { CATEGORY_LABELS } from "../helpers/categoryLabels"

export function BreakdownList({
  breakdown,
}: {
  breakdown: OfferOutput["breakdown"] | undefined
}) {
  if (!breakdown) {
    return <p className="text-sm text-muted-foreground">liczenie…</p>
  }

  const groups = COMPONENT_CATEGORIES.flatMap((category) => {
    const items = breakdown[category] ?? []
    return items.length === 0 ? [] : [{ category, items }]
  })

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Ten ciąg nie zawiera jeszcze żadnych elementów.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border border-y border-border text-sm leading-tight">
      {groups.map(({ category, items }) => (
        <Fragment key={category}>
          <li className="bg-muted/40 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {CATEGORY_LABELS[category]}
          </li>
          {items.map(({ id, label, quantity }) => (
            <li
              className="flex items-center justify-between gap-3 px-2 py-1"
              key={id}
            >
              <span className="truncate">{label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">
                {quantity}
              </span>
            </li>
          ))}
        </Fragment>
      ))}
    </ul>
  )
}
