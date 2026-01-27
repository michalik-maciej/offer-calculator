import { useForm } from "react-hook-form"

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
  onCancel: () => void
}

export function InventoryItemForm({
  defaultValues,
  onSubmit,
  onCancel,
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
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8 p-4">
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
            <SelectItem value="shelf">Półka</SelectItem>
            <SelectItem value="support">Wspornik</SelectItem>
            <SelectItem value="leg">Noga</SelectItem>
            <SelectItem value="foot">Stopa</SelectItem>
            <SelectItem value="back">Plecy</SelectItem>
            <SelectItem value="misc">Inne</SelectItem>
          </SelectContent>
        </Select>
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
      <div className="flex justify-end gap-4 pt-4">
        <Button variant="secondary" type="submit">
          Zapisz
        </Button>
        <Button variant="ghost" onClick={onCancel}>
          Anuluj
        </Button>
      </div>
    </form>
  )
}
