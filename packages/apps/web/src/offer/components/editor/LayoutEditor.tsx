import { Minus, Plus, Trash2 } from "lucide-react"
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  useWatch,
} from "react-hook-form"

import { DEFAULT_SHELF_COUNT_BY_HEIGHT } from "@/domain/models/shelfDefaults"
import { LayoutWall } from "@/schemas/LayoutWall.schema"

import { Button } from "../../../core/ui/button"
import { useInventoryDimensions } from "../../hooks/useInventoryDimensions"

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
    {children}
  </p>
)

const ValueDisplay = ({ value }: { value: number | null | undefined }) => (
  <span className="flex h-8 w-16 shrink-0 items-center justify-center rounded-md border border-input text-sm tabular-nums">
    {value != null ? value : "—"}
  </span>
)

const OptionStepper = ({
  name,
  label,
  options,
  onRemove,
}: {
  name: string
  label: string
  options: number[]
  onRemove?: () => void
}) => {
  const { control } = useFormContext<LayoutWall>()
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Controller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={name as any}
        control={control}
        render={({ field }) => {
          const idx = options.indexOf(field.value as number)
          return (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={options.length === 0 || idx <= 0}
                onClick={() => field.onChange(options[idx - 1])}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <ValueDisplay value={field.value as number} />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={options.length === 0 || idx >= options.length - 1}
                onClick={() =>
                  field.onChange(idx === -1 ? options[0] : options[idx + 1])
                }
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          )
        }}
      />
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

const CountStepper = ({
  name,
  label,
  min = 1,
  onRemove,
}: {
  name: string
  label: string
  min?: number
  onRemove?: () => void
}) => {
  const { control } = useFormContext<LayoutWall>()
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Controller
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        name={name as any}
        control={control}
        render={({ field }) => {
          const value = (field.value as number) ?? min
          return (
            <>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                disabled={value <= min}
                onClick={() => field.onChange(value - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <ValueDisplay value={value} />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() => field.onChange(value + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          )
        }}
      />
      {onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

const ShelvesFields = ({
  namePrefix,
  shelfDepthOptions,
  defaultShelfCount,
}: {
  namePrefix: string
  shelfDepthOptions: number[]
  defaultShelfCount: number
}) => {
  const { control } = useFormContext<LayoutWall>()
  const shelves = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: `${namePrefix}.shelves` as any,
  })

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <SectionLabel>Półki</SectionLabel>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() =>
            shelves.append({ depth: 0, numberOfShelves: defaultShelfCount })
          }
        >
          + Dodaj półkę
        </Button>
      </div>
      {shelves.fields.map((field, index) => (
        <div
          key={field.id}
          className="flex flex-col gap-1 border-l-2 border-border pl-3"
        >
          <OptionStepper
            name={`${namePrefix}.shelves.${index}.depth`}
            label="Głębokość"
            options={shelfDepthOptions}
          />
          <CountStepper
            name={`${namePrefix}.shelves.${index}.numberOfShelves`}
            label="Liczba półek"
            onRemove={() => shelves.remove(index)}
          />
        </div>
      ))}
    </div>
  )
}

const ShelfUnitItem = ({
  index,
  remove,
  widthOptions,
  shelfDepthOptions,
  defaultShelfCount,
}: {
  index: number
  remove: () => void
  widthOptions: number[]
  shelfDepthOptions: number[]
  defaultShelfCount: number
}) => (
  <div className="flex flex-col gap-2 rounded-md border border-border p-3">
    <OptionStepper
      name={`shelfUnits.${index}.width`}
      label="Szerokość"
      options={widthOptions}
    />
    <CountStepper
      name={`shelfUnits.${index}.numberOfShelfUnits`}
      label="Liczba regałów"
      onRemove={remove}
    />
    <ShelvesFields
      namePrefix={`shelfUnits.${index}`}
      shelfDepthOptions={shelfDepthOptions}
      defaultShelfCount={defaultShelfCount}
    />
  </div>
)

export function LayoutEditor({
  defaultValues,
  indexOfLayout,
}: {
  defaultValues: LayoutWall
  indexOfLayout: number
}) {
  const { layoutHeights, layoutDepths, shelfUnitWidths, shelfDepths } =
    useInventoryDimensions()

  const form = useForm<LayoutWall>({ defaultValues })
  const { control } = form

  const height = useWatch({ control, name: "height" })
  const defaultShelfCount = DEFAULT_SHELF_COUNT_BY_HEIGHT[height] ?? 1

  const { fields, append, remove } = useFieldArray({
    control,
    name: "shelfUnits",
  })

  return (
    <FormProvider {...form}>
      <div className="flex flex-col gap-6 p-4">
        <p className="font-semibold text-foreground/80">
          Ciąg nr {indexOfLayout + 1}
        </p>

        <div className="flex flex-col gap-2">
          <SectionLabel>Układ</SectionLabel>
          <OptionStepper
            name="depth"
            label="Głębokość"
            options={layoutDepths}
          />
          <OptionStepper
            name="height"
            label="Wysokość"
            options={layoutHeights}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <SectionLabel>Regały</SectionLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ width: 0, numberOfShelfUnits: 1, shelves: [] })
              }
            >
              + Dodaj
            </Button>
          </div>
          {fields.map((field, index) => (
            <ShelfUnitItem
              key={field.id}
              index={index}
              remove={() => remove(index)}
              widthOptions={shelfUnitWidths}
              shelfDepthOptions={shelfDepths}
              defaultShelfCount={defaultShelfCount}
            />
          ))}
        </div>
      </div>
    </FormProvider>
  )
}
