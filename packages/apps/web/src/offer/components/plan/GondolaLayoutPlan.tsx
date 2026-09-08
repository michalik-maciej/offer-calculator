import { useFieldArray, useFormContext, useWatch } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { LayoutPlanHeader } from "./LayoutPlanHeader"
import { SCALE_PX_PER_CM } from "./planScale"
import { ShelvesSummary } from "./ShelvesSummary"
import { isGondolaLayout } from "../../helpers/isGondolaLayout"
import { BreakdownList } from "../BreakdownList"
import { EditorPanel, PanelTab } from "../editor/EditorPanel"
import { ShelfUnitEditor } from "../editor/ShelfUnitEditor"

type LayoutPreview = OfferOutput["layouts"][number]

const GONDOLA_UNIT_INDEX = 0
const SIDES = [1, 2]

export function GondolaLayoutPlan({
  layoutIndex,
  onDuplicate,
  onRemove,
  onSelectShelf,
  onSelectTab,
  onSelectUnit,
  panelTab,
  preview,
  selectedShelfIndex,
  selectedUnitIndex,
}: {
  layoutIndex: number
  onDuplicate: () => void
  onRemove: () => void
  onSelectShelf: (shelfIndex: number) => void
  onSelectTab: (tab: PanelTab) => void
  onSelectUnit: (unitIndex: number | null) => void
  panelTab: PanelTab
  preview: LayoutPreview | undefined
  selectedShelfIndex: number
  selectedUnitIndex: number | null
}) {
  const { control, getValues } = useFormContext<OfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })

  const unitsPath =
    `layouts.${layoutIndex}.gondolaUnits.${GONDOLA_UNIT_INDEX}` as const

  const shelfUnits = useFieldArray({
    control,
    name: `${unitsPath}.shelfUnits`,
  })

  const canRemoveUnit = shelfUnits.fields.length > 1
  const selectedUnit =
    selectedUnitIndex === null ? null : shelfUnits.fields[selectedUnitIndex]

  const handleDuplicateUnit = (unitIndex: number) =>
    shelfUnits.insert(
      unitIndex + 1,
      structuredClone(getValues(`${unitsPath}.shelfUnits.${unitIndex}`)),
    )

  const handleRemoveUnit = (unitIndex: number) => {
    const wasLast = unitIndex === shelfUnits.fields.length - 1

    shelfUnits.remove(unitIndex)
    onSelectUnit(wasLast ? unitIndex - 1 : unitIndex)
  }

  if (!layout || !isGondolaLayout(layout)) return null

  const gondolaUnit = layout.gondolaUnits[GONDOLA_UNIT_INDEX]

  if (!gondolaUnit) return null

  const renderSide = (side: number) => (
    <div className="flex w-max border border-foreground/40">
      {shelfUnits.fields.map((unitField, unitIndex) => {
        const unit = gondolaUnit.shelfUnits[unitIndex]

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
              key={`${unitField.id}-${copyIndex}-${side}`}
              onClick={() => onSelectUnit(unitIndex)}
              style={{
                height: gondolaUnit.depth * SCALE_PX_PER_CM,
                width: unit.width * SCALE_PX_PER_CM,
              }}
              type="button"
            >
              <span>
                {[unit.width, gondolaUnit.depth, layout.height].join("/")}
              </span>
              <span className="text-muted-foreground">
                <ShelvesSummary
                  highlightedIndex={
                    selectedUnitIndex === unitIndex ? selectedShelfIndex : null
                  }
                  shelves={unit.shelves}
                />
              </span>
            </button>
          ),
        )
      })}
    </div>
  )

  return (
    <article className="flex flex-col gap-3">
      <LayoutPlanHeader
        layoutIndex={layoutIndex}
        onDuplicate={onDuplicate}
        onRemove={onRemove}
        preview={preview}
      />

      <div className="overflow-x-auto pb-2">
        <div className="w-max">
          <p className="mb-1.5 text-xs text-muted-foreground">Strona 1</p>
          <div className="flex flex-col gap-[3px]">
            {SIDES.map((side) => (
              <div key={side}>{renderSide(side)}</div>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">Strona 2</p>
        </div>
      </div>

      {selectedUnitIndex !== null && selectedUnit && (
        <EditorPanel
          onSelectTab={onSelectTab}
          tab={panelTab}
          title={`Ciąg ${layoutIndex + 1}`}
        >
          {panelTab === "edit" && (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Zmiany dotyczą obu stron gondoli.
              </p>
              <ShelfUnitEditor
                key={selectedUnit.id}
                layoutIndex={layoutIndex}
                onDuplicateUnit={() => handleDuplicateUnit(selectedUnitIndex)}
                {...(canRemoveUnit && {
                  onRemoveUnit: () => handleRemoveUnit(selectedUnitIndex),
                })}
                onSelectShelf={onSelectShelf}
                onSelectUnit={onSelectUnit}
                selectedShelfIndex={selectedShelfIndex}
                unitCount={shelfUnits.fields.length}
                unitIndex={selectedUnitIndex}
                unitsPath={unitsPath}
              />
            </>
          )}
          {panelTab === "breakdown" && (
            <BreakdownList breakdown={preview?.breakdown} />
          )}
        </EditorPanel>
      )}
    </article>
  )
}
