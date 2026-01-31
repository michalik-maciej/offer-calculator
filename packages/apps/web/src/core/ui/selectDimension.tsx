import { Controller, type ControllerProps } from "react-hook-form"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select"

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
}: Props) => (
  <div className="space-y-1">
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
          <SelectLabel>{label}</SelectLabel>
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
