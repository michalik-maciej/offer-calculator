import { Plus } from "lucide-react"
import { useFieldArray, useFormContext } from "react-hook-form"

import { OfferOutput } from "@/schemas/Offer.schema"

import { WallLayoutPlan } from "./plan/WallLayoutPlan"
import { Button } from "../../core/ui/button"
import { createDefaultWallLayout } from "../helpers/createDefaultWallLayout"
import { useInventoryDimensions } from "../hooks/useInventoryDimensions"
import { WallOfferInput } from "../offer.types"

export function OfferLayouts({ output }: { output: OfferOutput | undefined }) {
  const { control, getValues } = useFormContext<WallOfferInput>()
  const { append, fields, insert, remove } = useFieldArray({
    control,
    name: "layouts",
  })

  const dimensions = useInventoryDimensions()
  const defaultLayout = createDefaultWallLayout(dimensions)

  return (
    <section className="flex flex-col gap-8 px-8 pb-16">
      {fields.map((field, index) => (
        <WallLayoutPlan
          key={field.id}
          layoutIndex={index}
          onDuplicate={() =>
            insert(index + 1, structuredClone(getValues(`layouts.${index}`)))
          }
          onRemove={() => remove(index)}
          preview={output?.layouts[index]}
        />
      ))}

      <div className="flex flex-col items-start gap-2">
        <Button
          disabled={!defaultLayout}
          onClick={() => defaultLayout && append(defaultLayout)}
          type="button"
          variant="outline"
        >
          <Plus className="h-4 w-4" />
          Dodaj ciąg
        </Button>
        {!defaultLayout && (
          <p className="text-xs text-muted-foreground">
            Uzupełnij magazyn komponentów, żeby móc dodać ciąg.
          </p>
        )}
      </div>
    </section>
  )
}
