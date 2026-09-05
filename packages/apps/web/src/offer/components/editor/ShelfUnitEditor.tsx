import { ChevronLeft, ChevronRight, Minus, Plus, Trash2 } from "lucide-react"
import {
  Controller,
  FieldPathByValue,
  useFieldArray,
  useFormContext,
  useWatch,
} from "react-hook-form"

import { DEFAULT_SHELF_COUNT_BY_HEIGHT } from "@/domain/models/shelfDefaults"

import { ExtrasFields } from "./ExtrasFields"
import { Button } from "../../../core/ui/button"
import { useInventoryDimensions } from "../../hooks/useInventoryDimensions"
import { WallOfferInput } from "../../offer.types"

type NumericPath = FieldPathByValue<WallOfferInput, number>

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

const SectionNavigator = ({
  count,
  index,
  onSelect,
}: {
  count: number
  index: number
  onSelect: (index: number) => void
}) => (
  <div className="flex items-center gap-1">
    <Button
      className="h-7 w-7"
      disabled={index <= 0}
      onClick={() => onSelect(index - 1)}
      size="icon"
      type="button"
      variant="outline"
    >
      <ChevronLeft className="h-3 w-3" />
    </Button>
    <span className="w-12 text-center text-xs tabular-nums text-muted-foreground">
      {index + 1} z {count}
    </span>
    <Button
      className="h-7 w-7"
      disabled={index >= count - 1}
      onClick={() => onSelect(index + 1)}
      size="icon"
      type="button"
      variant="outline"
    >
      <ChevronRight className="h-3 w-3" />
    </Button>
  </div>
)

const OptionStepper = ({
  label,
  name,
  options,
}: {
  label: string
  name: NumericPath
  options: number[]
}) => {
  const { control } = useFormContext<WallOfferInput>()

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const currentIndex = options.indexOf(field.value)

          return (
            <>
              <Button
                className="h-8 w-8 shrink-0"
                disabled={currentIndex <= 0}
                onClick={() => field.onChange(options[currentIndex - 1])}
                size="icon"
                type="button"
                variant="outline"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <ValueDisplay value={field.value} />
              <Button
                className="h-8 w-8 shrink-0"
                disabled={
                  options.length === 0 || currentIndex >= options.length - 1
                }
                onClick={() =>
                  field.onChange(
                    currentIndex === -1
                      ? options[0]
                      : options[currentIndex + 1],
                  )
                }
                size="icon"
                type="button"
                variant="outline"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          )
        }}
      />
    </div>
  )
}

const CountStepper = ({
  label,
  min = 1,
  name,
  onRemove,
}: {
  label: string
  min?: number
  name: NumericPath
  onRemove?: () => void
}) => {
  const { control } = useFormContext<WallOfferInput>()

  return (
    <div className="flex items-center gap-1.5">
      <span className="w-28 shrink-0 text-sm text-muted-foreground">
        {label}
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field }) => {
          const value = field.value ?? min

          return (
            <>
              <Button
                className="h-8 w-8 shrink-0"
                disabled={value <= min}
                onClick={() => field.onChange(value - 1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <ValueDisplay value={value} />
              <Button
                className="h-8 w-8 shrink-0"
                onClick={() => field.onChange(value + 1)}
                size="icon"
                type="button"
                variant="outline"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </>
          )
        }}
      />
      {onRemove && (
        <Button
          className="h-8 w-8 shrink-0 text-destructive hover:text-destructive"
          onClick={onRemove}
          size="icon"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

const ShelvesFields = ({
  layoutIndex,
  onSelectShelf,
  selectedShelfIndex,
  shelfDepthOptions,
  unitIndex,
}: {
  layoutIndex: number
  onSelectShelf: (shelfIndex: number) => void
  selectedShelfIndex: number
  shelfDepthOptions: number[]
  unitIndex: number
}) => {
  const { control } = useFormContext<WallOfferInput>()
  const height = useWatch({ control, name: `layouts.${layoutIndex}.height` })
  const shelves = useFieldArray({
    control,
    name: `layouts.${layoutIndex}.shelfUnits.${unitIndex}.shelves`,
  })

  const shelfCount = shelves.fields.length
  const shelfIndex = Math.min(selectedShelfIndex, Math.max(shelfCount - 1, 0))
  const shelfPath =
    `layouts.${layoutIndex}.shelfUnits.${unitIndex}.shelves.${shelfIndex}` as const

  const handleAppend = () => {
    shelves.append({
      depth: shelfDepthOptions[0] ?? 0,
      numberOfShelves: DEFAULT_SHELF_COUNT_BY_HEIGHT[height] ?? 1,
    })
    onSelectShelf(shelfCount)
  }

  const handleRemove = () => {
    const wasLast = shelfIndex === shelfCount - 1

    shelves.remove(shelfIndex)
    onSelectShelf(wasLast ? Math.max(shelfIndex - 1, 0) : shelfIndex)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <SectionLabel>Półki</SectionLabel>
        {shelfCount > 0 && (
          <SectionNavigator
            count={shelfCount}
            index={shelfIndex}
            onSelect={onSelectShelf}
          />
        )}
      </div>

      {shelfCount === 0 ? (
        <p className="text-sm text-muted-foreground">Ten regał nie ma półek.</p>
      ) : (
        <>
          <OptionStepper
            label="Głębokość"
            name={`${shelfPath}.depth`}
            options={shelfDepthOptions}
          />
          <CountStepper
            label="Liczba półek"
            name={`${shelfPath}.numberOfShelves`}
            onRemove={handleRemove}
          />
        </>
      )}

      <Button
        className="self-start"
        disabled={shelfDepthOptions.length === 0}
        onClick={handleAppend}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Plus className="h-3 w-3" />
        Dodaj półki
      </Button>
    </div>
  )
}

export function ShelfUnitEditor({
  layoutIndex,
  onDuplicateUnit,
  onRemoveUnit,
  onSelectShelf,
  onSelectUnit,
  selectedShelfIndex,
  unitCount,
  unitIndex,
}: {
  layoutIndex: number
  onDuplicateUnit: () => void
  onRemoveUnit?: () => void
  onSelectShelf: (shelfIndex: number) => void
  onSelectUnit: (unitIndex: number) => void
  selectedShelfIndex: number
  unitCount: number
  unitIndex: number
}) {
  const { control } = useFormContext<WallOfferInput>()
  const { layoutDepths, layoutHeights, shelfDepths, shelfUnitWidths } =
    useInventoryDimensions()

  const unit = useWatch({
    control,
    name: `layouts.${layoutIndex}.shelfUnits.${unitIndex}`,
  })

  if (!unit) return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <SectionLabel>Ciąg</SectionLabel>
        <OptionStepper
          label="Głębokość bazy"
          name={`layouts.${layoutIndex}.depth`}
          options={layoutDepths}
        />
        <OptionStepper
          label="Wysokość"
          name={`layouts.${layoutIndex}.height`}
          options={layoutHeights}
        />
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <SectionLabel>Regały</SectionLabel>
          <SectionNavigator
            count={unitCount}
            index={unitIndex}
            onSelect={onSelectUnit}
          />
        </div>
        <OptionStepper
          label="Szerokość"
          name={`layouts.${layoutIndex}.shelfUnits.${unitIndex}.width`}
          options={shelfUnitWidths}
        />
        <CountStepper
          label="Liczba regałów"
          name={`layouts.${layoutIndex}.shelfUnits.${unitIndex}.numberOfShelfUnits`}
          onRemove={onRemoveUnit}
        />
        <Button
          className="self-start"
          onClick={onDuplicateUnit}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Plus className="h-3 w-3" />
          Dodaj regały
        </Button>
      </div>
      <ShelvesFields
        layoutIndex={layoutIndex}
        onSelectShelf={onSelectShelf}
        selectedShelfIndex={selectedShelfIndex}
        shelfDepthOptions={shelfDepths}
        unitIndex={unitIndex}
      />
      <ExtrasFields layoutIndex={layoutIndex} />
    </div>
  )
}
