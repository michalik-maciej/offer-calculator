import { FormProvider, useForm } from "react-hook-form"

import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { WallOfferInput } from "../offer.types"

export const FormCalculation = ({
  children,
}: {
  children: React.ReactNode
}) => {
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
    register,
    formState: { errors },
  } = form

  return (
    <FormProvider {...form}>
      <form onSubmit={(event) => event.preventDefault()}>
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
        {children}
      </form>
    </FormProvider>
  )
}
