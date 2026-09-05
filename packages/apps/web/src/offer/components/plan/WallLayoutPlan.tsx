import { Copy, Trash2 } from "lucide-react"
import { Fragment, useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { LayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferOutput } from "@/schemas/Offer.schema"

import { Badge } from "../../../core/ui/badge"
import { Button } from "../../../core/ui/button"
import { Drawer, DrawerContent, DrawerTitle } from "../../../core/ui/drawer"
import { Input } from "../../../core/ui/input"
import { Label } from "../../../core/ui/label"
import { formatPrice } from "../../helpers/formatPrice"
import { WallOfferInput } from "../../offer.types"
import { ShelfUnitEditor } from "../editor/ShelfUnitEditor"

const SCALE_PX_PER_CM = 1.6

type LayoutPreview = OfferOutput["layouts"][number]

function ShelvesSummary({
  highlightedIndex,
  shelves,
}: {
  highlightedIndex: number | null
  shelves: LayoutWall["shelfUnits"][number]["shelves"]
}) {
  if (shelves.length === 0) {
    return "bez półek"
  }

  return shelves.map(({ depth, numberOfShelves }, shelfIndex) => (
    <Fragment key={shelfIndex}>
      {shelfIndex > 0 && " + "}
      <span
        className={
          shelfIndex === highlightedIndex ? "font-semibold text-green-500" : ""
        }
      >
        {numberOfShelves}x{depth}
      </span>
    </Fragment>
  ))
}

export function WallLayoutPlan({
  layoutIndex,
  onDuplicate,
  onRemove,
  preview,
}: {
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  preview: LayoutPreview | undefined
}) {
  const { control, getValues, register } = useFormContext<WallOfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(
    null,
  )
  const [selectedShelfIndex, setSelectedShelfIndex] = useState(0)

  const selectUnit = (unitIndex: number | null) => {
    setSelectedUnitIndex(unitIndex)
    setSelectedShelfIndex(0)
  }

  const shelfUnits = useFieldArray({
    control,
    name: `layouts.${layoutIndex}.shelfUnits`,
  })

  const canRemoveUnit = shelfUnits.fields.length > 1
  const selectedUnit =
    selectedUnitIndex === null ? null : shelfUnits.fields[selectedUnitIndex]

  const handleDuplicateUnit = (unitIndex: number) =>
    shelfUnits.insert(
      unitIndex + 1,
      structuredClone(
        getValues(`layouts.${layoutIndex}.shelfUnits.${unitIndex}`),
      ),
    )

  const handleRemoveUnit = (unitIndex: number) => {
    const wasLast = unitIndex === shelfUnits.fields.length - 1

    shelfUnits.remove(unitIndex)
    selectUnit(wasLast ? unitIndex - 1 : unitIndex)
  }

  if (!layout) return null

  return (
    <article className="flex flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="secondary">{layoutIndex + 1}</Badge>
          <p className="text-sm text-muted-foreground">
            {preview?.description ?? "liczenie…"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-sm text-muted-foreground">Liczba ciągów</Label>
          <Input
            {...register(`layouts.${layoutIndex}.numberOfLayouts`, {
              valueAsNumber: true,
            })}
            className="h-8 w-16"
            min={1}
            type="number"
          />
          <span className="w-28 text-right text-sm tabular-nums">
            {preview ? formatPrice(preview.basePrice) : "—"}
          </span>
          <Button
            aria-label="Powiel ciąg"
            onClick={onDuplicate}
            size="icon"
            type="button"
            variant="outline"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            aria-label="Usuń ciąg"
            className="text-destructive hover:text-destructive"
            onClick={onRemove}
            size="icon"
            type="button"
            variant="ghost"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <div className="overflow-x-auto pb-2">
        <div className="flex w-max border border-foreground/40">
          {shelfUnits.fields.map((unitField, unitIndex) => {
            const unit = layout.shelfUnits[unitIndex]

            if (!unit) return null

            return Array.from(
              { length: Math.max(unit.numberOfShelfUnits, 0) },
              (_, copyIndex) => (
                <button
                  className={`flex shrink-0 flex-col items-center justify-center gap-1 border border-border text-xs tabular-nums transition-colors hover:bg-accent ${
                    selectedUnitIndex === unitIndex
                      ? "border-primary bg-accent"
                      : ""
                  }`}
                  key={`${unitField.id}-${copyIndex}`}
                  onClick={() => selectUnit(unitIndex)}
                  style={{
                    height: layout.depth * SCALE_PX_PER_CM,
                    width: unit.width * SCALE_PX_PER_CM,
                  }}
                  type="button"
                >
                  <span>
                    {[unit.width, layout.depth, layout.height].join("/")}
                  </span>
                  <span className="text-muted-foreground">
                    <ShelvesSummary
                      highlightedIndex={
                        selectedUnitIndex === unitIndex
                          ? selectedShelfIndex
                          : null
                      }
                      shelves={unit.shelves}
                    />
                  </span>
                </button>
              ),
            )
          })}
        </div>
      </div>
      <Drawer
        direction="right"
        onOpenChange={(isOpen) => !isOpen && selectUnit(null)}
        open={selectedUnitIndex !== null}
      >
        <DrawerContent className="py-6 pl-6">
          {selectedUnitIndex !== null && selectedUnit && (
            <>
              <DrawerTitle className="mb-4 pr-6">
                Ciąg {layoutIndex + 1}
              </DrawerTitle>

              <div className="min-h-0 flex-1 overflow-y-auto pr-6">
                <ShelfUnitEditor
                  key={selectedUnit.id}
                  layoutIndex={layoutIndex}
                  onDuplicateUnit={() => handleDuplicateUnit(selectedUnitIndex)}
                  {...(canRemoveUnit && {
                    onRemoveUnit: () => handleRemoveUnit(selectedUnitIndex),
                  })}
                  onSelectShelf={setSelectedShelfIndex}
                  onSelectUnit={selectUnit}
                  selectedShelfIndex={selectedShelfIndex}
                  unitCount={shelfUnits.fields.length}
                  unitIndex={selectedUnitIndex}
                />
              </div>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </article>
  )
}
