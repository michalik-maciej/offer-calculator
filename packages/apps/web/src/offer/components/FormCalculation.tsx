import { useEffect, useState } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"
import { useQuery } from "@tanstack/react-query"

import { OfferLayouts } from "./OfferLayouts"
import { PreviewErrorBanner } from "./PreviewErrorBanner"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { describePreviewError } from "../helpers/describePreviewError"
import { offerQueries } from "../offer.api"
import { WallOfferInput } from "../offer.types"

const PREVIEW_DEBOUNCE_MS = 500

export const FormCalculation = () => {
  const form = useForm<WallOfferInput>({
    defaultValues: {
      title: "",
      discountPercentage: 0,
      layouts: [],
    },
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const {
    control,
    getValues,
    register,
    formState: { errors },
  } = form

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

  const { data: preview, error } = useQuery(offerQueries.preview(draft))

  const errorMessage = describePreviewError(error)
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null)
  const visibleErrorMessage =
    errorMessage && errorMessage !== dismissedMessage ? errorMessage : null

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => event.preventDefault()}>
        {visibleErrorMessage && (
          <PreviewErrorBanner
            message={visibleErrorMessage}
            onDismiss={() => setDismissedMessage(visibleErrorMessage)}
          />
        )}

        <div className="flex flex-col gap-2 p-8 max-w-2xl">
          <Label>Opis oferty</Label>
          <Input
            {...register("title", {
              required: "Opis jest wymagany",
              validate: (value) =>
                value.trim().length > 0 || "Opis nie może być pusty",
            })}
            placeholder="Opis"
          />
          <p
            className={`text-xs text-destructive min-h-5 ${
              errors.title?.message ? "" : "invisible"
            }`}
          >
            {errors.title?.message}
          </p>

          <Label>Rabat (%)</Label>
          <Input
            {...register("discountPercentage", {
              setValueAs: (value) => {
                if (value === "" || value === null || value === undefined) {
                  return 0
                }
                return Number(value)
              },
              validate: (value) => {
                if (!Number.isFinite(value)) return "Musi być liczbą"
                if (value < 0) return "Minimum 0"
                if (value > 100) return "Maksimum 100"
                return true
              },
            })}
            placeholder="Rabat"
            type="number"
            inputMode="numeric"
          />
          <p
            className={`text-xs text-destructive min-h-5 ${
              errors.discountPercentage?.message ? "" : "invisible"
            }`}
          >
            {errors.discountPercentage?.message}
          </p>
        </div>

        <OfferLayouts preview={preview} />
      </form>
    </FormProvider>
  )
}
