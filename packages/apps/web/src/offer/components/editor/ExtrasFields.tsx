import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { COMPONENT_CATEGORIES } from "@/domain/models/component"
import { OfferInput } from "@/schemas/Offer.schema"

import { CountStepper } from "./CountStepper"
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

export function ExtrasFields({ layoutIndex }: { layoutIndex: number }) {
  const { control } = useFormContext<OfferInput>()
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
      <div className="flex items-center gap-1.5">
        <span className="w-28 shrink-0 text-sm text-muted-foreground">
          Inne elementy
        </span>
        <Select
          key={extraValues.length}
          onValueChange={(id) => extras.append({ id, quantity: 1 })}
        >
          <SelectTrigger className="h-8 flex-1" disabled={groups.length === 0}>
            <SelectValue placeholder="Dodaj element" />
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
      </div>

      {extras.fields.length > 0 && (
        <ul className="flex flex-col gap-2">
          {extras.fields.map((field, extraIndex) => {
            const componentId = extraValues[extraIndex]?.id
            const item = inventoryItems.find(({ id }) => id === componentId)

            return (
              <li key={field.id}>
                <CountStepper
                  label={item?.label ?? componentId ?? ""}
                  name={`layouts.${layoutIndex}.extras.${extraIndex}.quantity`}
                  onRemove={() => extras.remove(extraIndex)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
