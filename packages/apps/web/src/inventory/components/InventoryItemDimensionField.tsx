import { Controller, useFormContext } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { CATEGORY_REQUIREMENTS } from "@/domain/models/component"

import { type InventoryItemFormValues } from "./InventoryItem"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../core/ui/select"
import { inventoryQueries } from "../../inventory/api/inventory.api"
import { getDimensionOptions } from "../../inventory/helpers/getDimensionOptions"

interface Props {
  dimension: "width" | "height" | "depth"
  label: string
}

export const InventoryItemDimensionField = ({ dimension, label }: Props) => {
  const { data: optionsByCategory } = useQuery({
    ...inventoryQueries.list(),
    select: (data) =>
      getDimensionOptions({
        dimension,
        inventoryItems: data,
      }),
  })
  const { control, watch } = useFormContext<InventoryItemFormValues>()
  const category = watch("category")
  const options =
    category && optionsByCategory ? optionsByCategory[category] : []
  const isRequired =
    CATEGORY_REQUIREMENTS[category]?.required.includes(dimension)

  return (
    <div className="flex flex-col space-y-1 gap-2">
      <Label
        className={
          isRequired || category === "misc"
            ? "font-semibold"
            : "text-muted-foreground"
        }
      >
        {label}
      </Label>
      <Controller
        name={dimension}
        control={control}
        rules={{
          required: isRequired && category !== "misc" ? "Pole wymagane" : false,
          validate: (value) => {
            if (value === null) {
              return isRequired && category !== "misc" ? "Pole wymagane" : true
            }

            if (typeof value !== "number" || !Number.isFinite(value)) {
              return "Nieprawidłowa wartość"
            }

            return true
          },
        }}
        render={({ field }) =>
          category === "misc" ? (
            <Input
              min={0}
              type="number"
              inputMode="numeric"
              placeholder="—"
              value={field.value == null ? "" : String(field.value)}
              onChange={(e) => {
                const raw = e.target.value
                field.onChange(raw === "" ? null : Number(raw))
              }}
            />
          ) : (
            <Select
              disabled={!isRequired}
              value={field.value == null ? undefined : String(field.value)}
              onValueChange={(v) => field.onChange(Number(v))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {options.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
      />
    </div>
  )
}
