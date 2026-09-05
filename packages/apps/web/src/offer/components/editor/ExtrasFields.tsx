import { X } from "lucide-react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { COMPONENT_CATEGORIES } from "@/domain/models/component"

import { Badge } from "../../../core/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../../../core/ui/select"
import { inventoryQueries } from "../../../inventory/inventory.api"
import { CATEGORY_LABELS } from "../../helpers/categoryLabels"
import { WallOfferInput } from "../../offer.types"

export function ExtrasFields({ layoutIndex }: { layoutIndex: number }) {
  const { control } = useFormContext<WallOfferInput>()
  const { data: inventoryItems = [] } = useQuery(inventoryQueries.list())

  const extras = useFieldArray({
    control,
    name: `layouts.${layoutIndex}.extras`,
  })

  const extraValues =
    useWatch({ control, name: `layouts.${layoutIndex}.extras` }) ?? []

  const addedIds = new Set(extraValues.map((extra) => extra.id))
  const availableItems = inventoryItems.filter(({ id }) => !addedIds.has(id))

  const groups = COMPONENT_CATEGORIES.flatMap((category) => {
    const items = availableItems.filter((item) => item.category === category)
    return items.length === 0 ? [] : [{ category, items }]
  })

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Inne elementy ciągu
      </p>

      <Select
        key={extraValues.length}
        onValueChange={(id) => extras.append({ id, quantity: 1 })}
      >
        <SelectTrigger disabled={groups.length === 0}>
          <SelectValue placeholder="Wybierz element" />
        </SelectTrigger>
        <SelectContent>
          {groups.map(({ category, items }) => (
            <SelectGroup key={category}>
              <SelectLabel>{CATEGORY_LABELS[category]}</SelectLabel>
              {items.map(({ id, label }) => (
                <SelectItem key={id} value={id}>
                  {label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>

      {extras.fields.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {extras.fields.map((field, extraIndex) => {
            const componentId = extraValues[extraIndex]?.id
            const item = inventoryItems.find(({ id }) => id === componentId)

            return (
              <li key={field.id}>
                <Badge className="gap-1 pr-1" variant="selected">
                  {item?.label ?? componentId}
                  <button
                    aria-label="Usuń element"
                    className="rounded-sm hover:text-destructive"
                    onClick={() => extras.remove(extraIndex)}
                    type="button"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
