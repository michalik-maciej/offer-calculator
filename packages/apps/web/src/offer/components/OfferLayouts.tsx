import { Plus } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { OfferInput, OfferOutput } from "@/schemas/Offer.schema"

import { EditorPanel, PanelTab } from "./editor/EditorPanel"
import { GondolaLayoutPlan } from "./plan/GondolaLayoutPlan"
import { WallLayoutPlan } from "./plan/WallLayoutPlan"
import { Button } from "../../core/ui/button"
import { createDefaultGondolaLayout } from "../helpers/createDefaultGondolaLayout"
import { createDefaultWallLayout } from "../helpers/createDefaultWallLayout"
import { isGondolaLayout } from "../helpers/isGondolaLayout"
import { useInventoryDimensions } from "../hooks/useInventoryDimensions"

type SelectedUnit = {
  layoutIndex: number
  unitIndex: number
}

export function OfferLayouts({ output }: { output: OfferOutput | undefined }) {
  const { control, getValues } = useFormContext<OfferInput>()
  const { append, fields, insert, remove } = useFieldArray({
    control,
    name: "layouts",
  })
  const [selectedUnit, setSelectedUnit] = useState<SelectedUnit | null>(null)
  const [selectedShelfIndex, setSelectedShelfIndex] = useState(0)
  const [panelTab, setPanelTab] = useState<PanelTab>("edit")

  const dimensions = useInventoryDimensions()
  const defaultWallLayout = createDefaultWallLayout(dimensions)
  const defaultGondolaLayout = createDefaultGondolaLayout(dimensions)

  const selectUnit = (layoutIndex: number, unitIndex: number | null) => {
    setSelectedUnit(unitIndex === null ? null : { layoutIndex, unitIndex })
    setSelectedShelfIndex(0)
  }

  return (
    <section className="flex flex-col gap-8 px-8 pb-16 mr-90">
      {fields.map((field, index) => {
        const layout = getValues(`layouts.${index}`)
        const Plan =
          layout && isGondolaLayout(layout) ? GondolaLayoutPlan : WallLayoutPlan

        return (
          <Plan
            key={field.id}
            layoutIndex={index}
            onDuplicate={() => {
              insert(index + 1, structuredClone(getValues(`layouts.${index}`)))
              setSelectedUnit(null)
            }}
            onRemove={() => {
              remove(index)
              setSelectedUnit(null)
            }}
            onSelectShelf={setSelectedShelfIndex}
            onSelectTab={setPanelTab}
            onSelectUnit={(unitIndex) => selectUnit(index, unitIndex)}
            panelTab={panelTab}
            preview={output?.layouts[index]}
            selectedShelfIndex={selectedShelfIndex}
            selectedUnitIndex={
              selectedUnit?.layoutIndex === index
                ? selectedUnit.unitIndex
                : null
            }
          />
        )
      })}

      <div className="flex flex-col items-start gap-2">
        <div className="flex flex-wrap items-center bg-muted rounded-md gap-1">
          <div className="flex items-center mx-4">
            <Plus className="h-4 w-4" />
            Dodaj ciąg
          </div>
          <Button
            disabled={!defaultWallLayout}
            onClick={() => defaultWallLayout && append(defaultWallLayout)}
            type="button"
            variant="outline"
          >
            przyścienny
          </Button>
          <Button
            disabled={!defaultGondolaLayout}
            onClick={() => defaultGondolaLayout && append(defaultGondolaLayout)}
            type="button"
            variant="outline"
          >
            gondola
          </Button>
        </div>
        {!defaultWallLayout && (
          <p className="text-xs text-muted-foreground">
            Uzupełnij magazyn komponentów, żeby móc dodać ciąg.
          </p>
        )}
      </div>

      {!selectedUnit && (
        <EditorPanel title="Edycja">
          <p className="text-sm text-muted-foreground">
            Kliknij regał na planie, żeby edytować jego wymiary i półki.
          </p>
        </EditorPanel>
      )}
    </section>
  )
}
