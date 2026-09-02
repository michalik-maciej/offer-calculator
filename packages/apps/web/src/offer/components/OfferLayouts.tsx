import { Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { useFieldArray, useFormContext, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { WallLayoutPlan } from "./plan/WallLayoutPlan"
import { Button } from "../../core/ui/button"
import { createDefaultWallLayout } from "../helpers/createDefaultWallLayout"
import { useInventoryDimensions } from "../hooks/useInventoryDimensions"
import { offerQueries } from "../offer.api"
import { WallOfferInput } from "../offer.types"

const PREVIEW_DEBOUNCE_MS = 500

export function OfferLayouts() {
  const { control, getValues } = useFormContext<WallOfferInput>()
  const { append, fields, insert, remove } = useFieldArray({
    control,
    name: "layouts",
  })

  const dimensions = useInventoryDimensions()
  const defaultLayout = createDefaultWallLayout(dimensions)

  const watchedValues = useWatch({
    control,
    name: ["layouts", "discountPercentage"],
  })
  const [draft, setDraft] = useState<WallOfferInput | null>(null)

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setDraft(getValues()),
      PREVIEW_DEBOUNCE_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [watchedValues, getValues])

  const { data: preview } = useQuery(offerQueries.preview(draft))

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
          preview={preview?.layouts[index]}
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
