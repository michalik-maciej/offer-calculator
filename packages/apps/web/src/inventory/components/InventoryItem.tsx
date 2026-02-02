import { Loader2, RefreshCwOff, SaveIcon, Trash2Icon } from "lucide-react"
import { Controller, FormProvider, useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import {
  COMPONENT_CATEGORIES,
  type ComponentCategory,
} from "@/domain/models/component"

import { InventoryItemDimensionField } from "./InventoryItemDimensionField"
import { CATEGORY_LABELS } from "./labels.inventory"
import { Badge } from "../../core/ui/badge"
import { Button } from "../../core/ui/button"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { RadioGroup, RadioGroupItem } from "../../core/ui/radio-group"
import { useCreateInventoryItem } from "../hooks/useCreateInventoryItem"
import { useDeleteInventoryItem } from "../hooks/useDeleteInventoryItem"
import { useUpdateInventoryItem } from "../hooks/useUpdateInventoryItem"

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

export function InventoryItem({ defaultValues, onClose }: Props) {
  const { componentId } = useParams({ strict: false })
  const createMutation = useCreateInventoryItem()
  const updateMutation = useUpdateInventoryItem()
  const deleteMutation = useDeleteInventoryItem()

  const form = useForm<InventoryItemFormValues>({
    defaultValues: {
      label: "Nowy element",
      category: "back",
      price: 0,
      width: null,
      height: null,
      depth: null,
      ...defaultValues,
    },
  })

  const { control, register, handleSubmit, formState } = form

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
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6 p-4">
        <div className="flex gap-4">
          {/* Label */}
          <div className="flex flex-col grow space-y-1 gap-2">
            <Label>Nazwa</Label>
            <Input
              {...register("label", {
                required: "Nazwa jest wymagana",
                validate: (value) =>
                  value.trim().length > 0 || "Nazwa nie może być pusta",
              })}
            />
            <p
              className={`text-xs text-destructive min-h-5 ${
                formState.errors.label?.message ? "" : "invisible"
              }`}
            >
              {formState.errors.label?.message}
            </p>
          </div>
          {/* Price */}
          <div className="flex flex-col w-36 space-y-1 gap-2">
            <Label>Cena</Label>
            <Input
              type="number"
              step="0.01"
              min={0}
              {...register("price", {
                valueAsNumber: true,
                required: "Cena jest wymagana",
                validate: (value) =>
                  Number.isFinite(value) && value > 0
                    ? true
                    : "Cena musi być dodatnia",
              })}
            />
            <p
              className={`text-xs text-destructive min-h-5 ${
                formState.errors.price?.message ? "" : "invisible"
              }`}
            >
              {formState.errors.price?.message}
            </p>
          </div>
        </div>

        {/* Category */}
        <div className="space-y-1">
          <Label className="p-y-1">Kategoria</Label>

          <Controller
            name="category"
            control={control}
            rules={{
              required: "Kategoria jest wymagana",
              validate: (value) =>
                COMPONENT_CATEGORIES.includes(value) ||
                "Nieprawidłowa kategoria",
            }}
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
          <p
            className={`text-xs text-destructive min-h-5 ${
              formState.errors.category?.message ? "" : "invisible"
            }`}
          >
            {formState.errors.category?.message}
          </p>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-4 h-20">
          <InventoryItemDimensionField dimension="width" label="Szerokość" />
          <InventoryItemDimensionField dimension="height" label="Wysokość" />
          <InventoryItemDimensionField dimension="depth" label="Głębokość" />
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
          <div className="flex ml-auto gap-4">
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
              <RefreshCwOff />
              Anuluj
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
