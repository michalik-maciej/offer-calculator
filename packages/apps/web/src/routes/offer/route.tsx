import { FilePlus2, Loader2, Trash2 } from "lucide-react"
import { useState } from "react"
import { useFieldArray, useFormContext, useFormState } from "react-hook-form"
import { createFileRoute } from "@tanstack/react-router"

import { Badge } from "../../core/ui/badge"
import { Button } from "../../core/ui/button"
import { ConfirmDialog } from "../../core/ui/confirm-dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { OfferList } from "../../offer/components/OfferList"
import { formatPrice } from "../../offer/helpers/formatPrice"
import { useAutoSaveState } from "../../offer/hooks/useAutoSaveState"
import { useCreateOffer } from "../../offer/hooks/useCreateOffer"
import { useDeleteOffer } from "../../offer/hooks/useDeleteOffer"
import { useOffer } from "../../offer/hooks/useOffer"
import { WallOfferInput } from "../../offer/offer.types"

export const Route = createFileRoute("/offer")({
  component: OfferPage,
})

function OfferPage() {
  const {
    control,
    formState: { errors },
    register,
  } = useFormContext<WallOfferInput>()
  const { isDirty } = useFormState({ control })
  const { fields } = useFieldArray({ control, name: "layouts" })

  const { offer, offerId } = useOffer()
  const { hasFailed, isSaving } = useAutoSaveState()
  const createOffer = useCreateOffer()
  const deleteOffer = useDeleteOffer()
  const [confirming, setConfirming] = useState<"delete" | "new" | null>(null)

  const output = offer?.output

  return (
    <section className="flex max-w-3xl flex-col gap-6 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-semibold">Oferta</h1>
        <div className="flex items-center gap-2">
          {offerId && (
            <span
              className={`mr-2 text-xs ${
                hasFailed ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {hasFailed
                ? "Nie zapisano"
                : isSaving
                  ? "Zapisywanie…"
                  : isDirty
                    ? "Niezapisane zmiany"
                    : "Zapisano"}
            </span>
          )}
          <Button
            disabled={createOffer.isPending}
            onClick={() =>
              offerId ? setConfirming("new") : createOffer.mutate()
            }
            type="button"
            variant="outline"
          >
            {createOffer.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FilePlus2 className="h-4 w-4" />
            )}
            Nowa
          </Button>
          <OfferList />
          <Button
            className="text-destructive hover:text-destructive"
            disabled={!offerId || deleteOffer.isPending}
            onClick={() => setConfirming("delete")}
            type="button"
            variant="outline"
          >
            <Trash2 className="h-4 w-4" />
            Usuń
          </Button>
        </div>
      </div>

      {!offerId ? (
        <p className="text-sm text-muted-foreground">
          Nie masz otwartej oferty. Utwórz nową albo wczytaj zapisaną.
        </p>
      ) : (
        <>
          <div className="flex max-w-md flex-col gap-2">
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
              className={`min-h-5 text-xs text-destructive ${
                errors.title?.message ? "" : "invisible"
              }`}
            >
              {errors.title?.message}
            </p>
          </div>

          <div className="flex max-w-xs flex-col gap-2">
            <Label>Rabat (%)</Label>
            <Input
              {...register("discountPercentage", {
                setValueAs: (value) =>
                  value === "" || value === null || value === undefined
                    ? 0
                    : Number(value),
                validate: (value) => {
                  if (!Number.isFinite(value)) return "Musi być liczbą"
                  if (value < 0) return "Minimum 0"
                  if (value > 100) return "Maksimum 100"
                  return true
                },
              })}
              inputMode="numeric"
              placeholder="Rabat"
              type="number"
            />
            <p
              className={`min-h-5 text-xs text-destructive ${
                errors.discountPercentage?.message ? "" : "invisible"
              }`}
            >
              {errors.discountPercentage?.message}
            </p>
          </div>

          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ta oferta nie ma jeszcze żadnych ciągów. Dodaj je w
              Konfiguratorze.
            </p>
          ) : (
            <ul className="divide-y divide-border border-y border-border">
              {fields.map((field, index) => {
                const layoutOutput = output?.layouts[index]

                return (
                  <li
                    className="flex items-center justify-between gap-4 py-2"
                    key={field.id}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Badge variant="secondary">{index + 1}</Badge>
                      <span className="truncate text-sm text-muted-foreground">
                        {layoutOutput?.description ?? "brak wyceny"}
                      </span>
                    </div>
                    <span className="shrink-0 text-sm tabular-nums">
                      {layoutOutput ? formatPrice(layoutOutput.basePrice) : "—"}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}

          {output && (
            <dl className="flex max-w-xs flex-col gap-1 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Wartość</dt>
                <dd className="tabular-nums">
                  {formatPrice(output.pricing.basePrice)}
                </dd>
              </div>
              <div className="flex justify-between gap-4 font-semibold">
                <dt>Po rabacie {output.pricing.discountPercentage}%</dt>
                <dd className="tabular-nums">
                  {formatPrice(output.pricing.discountPrice)}
                </dd>
              </div>
            </dl>
          )}
        </>
      )}

      <ConfirmDialog
        confirmLabel={
          confirming === "delete" ? "Usuń ofertę" : "Utwórz nową ofertę"
        }
        description={
          confirming === "delete"
            ? "Usunięcia zapisanej oferty nie da się cofnąć."
            : "Bieżąca oferta zostanie zamknięta. Jest zapisana, więc wrócisz do niej przez Wczytaj."
        }
        isPending={createOffer.isPending || deleteOffer.isPending}
        onConfirm={() => {
          if (confirming === "delete") {
            deleteOffer.mutate()
          } else {
            createOffer.mutate()
          }
          setConfirming(null)
        }}
        onOpenChange={(open) => !open && setConfirming(null)}
        open={confirming !== null}
        title={confirming === "delete" ? "Usunąć ofertę?" : "Nowa oferta"}
      />
    </section>
  )
}
