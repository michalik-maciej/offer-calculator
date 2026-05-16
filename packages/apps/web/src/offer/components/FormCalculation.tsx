import { Button } from "packages/apps/web/src/core/ui/button"
import { Input } from "packages/apps/web/src/core/ui/input"
import { Label } from "packages/apps/web/src/core/ui/label"
import { useCallback, useEffect, useRef } from "react"
import { FormProvider, useForm, useWatch } from "react-hook-form"

import { OfferInput } from "@/schemas/Offer.schema"

import { usePreviewOffer } from "../hooks/usePreviewOffer"

export const FormCalculation = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const form = useForm<OfferInput>({
    defaultValues: {
      title: "",
      discountPercentage: 0,
      layouts: [],
    },
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const previewOffer = usePreviewOffer()

  const onSubmit = useCallback(
    (values: OfferInput) => {
      const normalized: OfferInput = {
        ...values,
        title: values.title.trim(),
      }

      previewOffer.mutate(normalized)
    },
    [previewOffer],
  )

  const debounceTimeoutRef = useRef<number | null>(null)
  const hasMountedRef = useRef(false)
  const watchedValues = useWatch({ control: form.control })

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true
      return
    }

    if (debounceTimeoutRef.current !== null) {
      window.clearTimeout(debounceTimeoutRef.current)
    }

    debounceTimeoutRef.current = window.setTimeout(() => {
      form.handleSubmit(onSubmit)()
    }, 300000)

    return () => {
      if (debounceTimeoutRef.current !== null) {
        window.clearTimeout(debounceTimeoutRef.current)
      }
    }
  }, [form, onSubmit, watchedValues])

  const {
    register,
    formState: { errors },
  } = form

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div id="drawer">{children}</div>
        <div className="flex flex-col gap-2 p-24 max-w-8/12">
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
          <div className="flex flex-col gap-2">
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
          </div>
          <Button
            type="submit"
            disabled={!form.formState.isValid || previewOffer.isPending}
            className="bg-blue-500 text-slate-200 px-4 py-2 rounded-xl w-1/4 self-end mt-2 mx-4 hover:bg-blue-600 focus:ring-2 focus:ring-blue-900 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          >
            Oblicz
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
