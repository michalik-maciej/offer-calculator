import { Loader2, SaveIcon, Trash2Icon } from "lucide-react"
import { Controller, useForm } from "react-hook-form"
import { useParams } from "@tanstack/react-router"

import { Button } from "../../core/ui/button"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../core/ui/select"
import { useCreateInventoryItem } from "../../inventory/hooks/useCreateInventoryItem"
import { useDeleteInventoryItem } from "../../inventory/hooks/useDeleteInventoryItem"
import { useUpdateInventoryItem } from "../../inventory/hooks/useUpdateInventoryItem"

export type InventoryItemFormValues = {
  label: string
  category: string
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
        category: "",
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
        <Label>Kategoria</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorię" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shelf">Półka</SelectItem>
                <SelectItem value="support">Wspornik</SelectItem>
                <SelectItem value="leg">Noga</SelectItem>
                <SelectItem value="foot">Stopa</SelectItem>
                <SelectItem value="back">Plecy</SelectItem>
                <SelectItem value="misc">Inne</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label className="w-16">Szerokość</Label>
          <Input
            type="number"
            {...register("width", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <Label>Wysokość</Label>
          <Input
            type="number"
            {...register("height", { valueAsNumber: true })}
          />
        </div>

        <div className="space-y-1">
          <Label>Głębokość</Label>
          <Input
            type="number"
            {...register("depth", { valueAsNumber: true })}
          />
        </div>
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
