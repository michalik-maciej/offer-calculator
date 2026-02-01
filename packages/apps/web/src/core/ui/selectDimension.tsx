import { Controller, type ControllerProps } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { Label } from "../../core/ui/label"

interface Props {
  control: ControllerProps["control"]
  label: string
  name: "width" | "height" | "depth"
  options: number[]
  required?: boolean
}

export const SelectDimension = ({
  control,
  label,
  name,
  options,
  required,
}: Props) => {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? "Pole wymagane" : false,
        }}
        render={({ field }) => (
          <Select
            value={field.value?.toString() ?? ""}
            onValueChange={(v) => field.onChange(Number(v))}
          >
            <SelectTrigger>
              <SelectValue placeholder="—" />
            </SelectTrigger>
            <SelectContent>
              {options.map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
    </div>
  )
}
