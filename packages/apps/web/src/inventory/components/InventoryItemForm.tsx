import { Loader2, SaveIcon, Trash2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import { CATEGORY_LABELS } from "./labels.inventory"
import {
  CATEGORY_REQUIREMENTS,
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from "../../../../../domain/src/models/component"
import { Badge } from "../../core/ui/badge"
import { Button } from "../../core/ui/button"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { RadioGroup, RadioGroupItem } from "../../core/ui/radio-group"
import { SelectDimension } from "../../core/ui/selectDimension"
import { useCreateInventoryItem } from "../../inventory/hooks/useCreateInventoryItem"
import { useDeleteInventoryItem } from "../../inventory/hooks/useDeleteInventoryItem"
import { useUpdateInventoryItem } from "../../inventory/hooks/useUpdateInventoryItem"

export type InventoryItemFormValues = {
  label: string
  category: ComponentCategory
  price: number
  width: number | null
  height: number | null
  depth: number | null
}

type Props = {
  defaultValues?: InventoryItemFormValues
  onClose: () => void
}

export function InventoryItemForm({ defaultValues, onClose }: Props) {
  const { componentId } = useParams({ strict: false })
  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()

  const { control, register, handleSubmit, formState } =
    useForm<InventoryItemFormValues>({
      defaultValues: {
        label: "",
        category: "" as ComponentCategory,
        price: 0,
        width: null,
        height: null,
        depth: null,
        ...defaultValues,
      },
    })

  const submit = async (formValues: InventoryItemFormValues) => {
    const normalizedValues: InventoryItemFormValues = {
      ...formValues,
      width: formValues.width ?? null,
      height: formValues.height ?? null,
      depth: formValues.depth ?? null,
    }

    if (componentId) {
      await updateMutation.mutateAsync({
        id: componentId,
        data: normalizedValues,
      })
    } else {
      await createMutation.mutateAsync(normalizedValues)
    }

    onClose()
  }

  const handleDelete = async () => {
    if (!componentId) return
    await deleteMutation.mutateAsync(componentId)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-8 p-4">
      {/* Label */}
      <div className="space-y-1">
        <Label>Nazwa</Label>
        <Input {...register("label", { required: true })} />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <Label className="p-y-1">Kategoria</Label>

        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-wrap gap-2 mt-2"
            >
              {COMPONENT_CATEGORIES.map((category) => {
                const id = `category-${category}`
                const isSelected = field.value === category

                return (
                  <div key={category} className="flex items-center">
                    <RadioGroupItem
                      id={id}
                      value={category}
                      className="hidden"
                    />
                    <Label htmlFor={id} className="cursor-pointer">
                      <Badge variant={isSelected ? "selected" : "outline"}>
                        {CATEGORY_LABELS[category]}
                      </Badge>
                    </Label>
                  </div>
                )
              })}
            </RadioGroup>
          )}
        />
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-2">
        <SelectDimension
          control={control}
          name="width"
          label="Szerokość"
          options={[]}
        />

        <SelectDimension
          control={control}
          name="height"
          label="Wysokość"
          options={[]}
        />

        <SelectDimension
          control={control}
          name="depth"
          label="Głębokość"
          options={[]}
        />
      </div>

      {/* Price */}
      <div className="space-y-1">
        <Label>Cena</Label>
        <Input
          type="number"
          step="0.01"
          {...register("price", { valueAsNumber: true })}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between gap-4 pt-4">
        <Button
          type="button"
          size="icon"
          disabled={deleteMutation.isPending}
          variant="destructive"
          onClick={handleDelete}
          hidden={!componentId}
        >
          {deleteMutation.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Trash2Icon />
          )}
        </Button>
        <div className="flex ml-auto gap-2">
          <Button
            variant="secondary"
            type="submit"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              <SaveIcon />
            )}
            Zapisz
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Anuluj
          </Button>
        </div>
      </div>
    </form>
  )
}
