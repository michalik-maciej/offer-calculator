import { Copy, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { LayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferOutput } from "@/schemas/Offer.schema"

import { Badge } from "../../../core/ui/badge"
import { Button } from "../../../core/ui/button"
import { Input } from "../../../core/ui/input"
import { Label } from "../../../core/ui/label"
import { formatPrice } from "../../helpers/formatPrice"
import { WallOfferInput } from "../../offer.types"

const SCALE_PX_PER_CM = 1.6

type LayoutPreview = OfferOutput["layouts"][number]

function summariseShelves(
  shelves: LayoutWall["shelfUnits"][number]["shelves"],
) {
  if (shelves.length === 0) {
    return "bez półek"
  }

  return shelves
    .map(({ depth, numberOfShelves }) => `${numberOfShelves}x${depth}`)
    .join(" + ")
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
  const { control, register } = useFormContext<WallOfferInput>()
  const layout = useWatch({ control, name: `layouts.${layoutIndex}` })
  const [selectedUnitIndex, setSelectedUnitIndex] = useState<number | null>(
    null,
  )

  if (!layout) {
    return null
  }

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
          <Label className="text-sm text-muted-foreground">Ilość ciągów</Label>
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
          {layout.shelfUnits.map((unit, unitIndex) =>
            Array.from(
              { length: Math.max(unit.numberOfShelfUnits, 0) },
              (_, copyIndex) => (
                <button
                  className={`flex shrink-0 flex-col items-center justify-center gap-1 border border-border text-xs tabular-nums transition-colors hover:bg-accent ${
                    selectedUnitIndex === unitIndex
                      ? "border-primary bg-accent"
                      : ""
                  }`}
                  key={`${unitIndex}-${copyIndex}`}
                  onClick={() => setSelectedUnitIndex(unitIndex)}
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
                    {summariseShelves(unit.shelves)}
                  </span>
                </button>
              ),
            ),
          )}
        </div>
      </div>
    </article>
  )
}
