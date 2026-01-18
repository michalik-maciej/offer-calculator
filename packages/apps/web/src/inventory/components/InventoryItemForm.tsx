import { useForm } from "react-hook-form"

import { Button } from "../../shared/ui/button"
import { Input } from "../../shared/ui/input"
import { Label } from "../../shared/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../shared/ui/select"

export type InventoryItemFormValues = {
  label: string
  category: string
  price: number
  width?: number | null
  height?: number | null
  depth?: number | null
}

type Props = {
  defaultValues?: InventoryItemFormValues
  onSubmit: (values: InventoryItemFormValues) => void
  onDelete?: () => void
}

export function InventoryItemForm({
  defaultValues,
  onSubmit,
  onDelete,
}: Props) {
  const { register, handleSubmit, setValue, getValues } =
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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Label */}
      <div className="space-y-1">
        <Label>Nazwa</Label>
        <Input {...register("label", { required: true })} />
      </div>

      {/* Category */}
      <div className="space-y-1">
        <Label>Kategoria</Label>
        <Select
          value={getValues("category")}
          onValueChange={(v) => setValue("category", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz kategorię" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="shelf">Shelf</SelectItem>
            <SelectItem value="support">Support</SelectItem>
            <SelectItem value="leg">Leg</SelectItem>
            <SelectItem value="foot">Foot</SelectItem>
            <SelectItem value="back">Back</SelectItem>
            <SelectItem value="misc">Misc</SelectItem>
          </SelectContent>
        </Select>
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

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label>Szerokość</Label>
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

      {/* Actions */}
      <div className="flex justify-between gap-2 pt-4">
        {onDelete && (
          <Button type="button" variant="destructive" onClick={onDelete}>
            Usuń
          </Button>
        )}

        <Button type="submit">Zapisz</Button>
      </div>
    </form>
  )
}
