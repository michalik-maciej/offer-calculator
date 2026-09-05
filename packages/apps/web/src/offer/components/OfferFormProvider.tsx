import { ReactNode, useEffect, useRef, useState } from "react"
import { FormProvider, useForm, useFormState, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import { SavedOffer } from "@/schemas/Offer.schema"

import { PreviewErrorBanner } from "./PreviewErrorBanner"
import { createDefaultOfferTitle } from "../helpers/createDefaultOfferTitle"
import { describeMissingComponent } from "../helpers/describeMissingComponent"
import { useOffer } from "../hooks/useOffer"
import { offerApi, offerMutationKeys, offerQueries } from "../offer.api"
import { WallOfferInput } from "../offer.types"

const AUTOSAVE_DEBOUNCE_MS = 800

export function OfferFormProvider({ children }: { children: ReactNode }) {
  const form = useForm<WallOfferInput>({
    defaultValues: {
      discountPercentage: 30,
      layouts: [],
      title: createDefaultOfferTitle(),
    },
    mode: "onChange",
    reValidateMode: "onChange",
  })

  const { control, getValues, reset } = form
  const queryClient = useQueryClient()
  const { offer, offerId } = useOffer()

  const hydratedIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (offer && hydratedIdRef.current !== offer.id) {
      hydratedIdRef.current = offer.id
      reset(offer.input as WallOfferInput)
    }
  }, [offer, reset])

  const autoSave = useMutation({
    mutationKey: offerMutationKeys.autoSave,
    mutationFn: (values: WallOfferInput) =>
      offerApi.update({ data: values, params: { id: offerId ?? "" } }),
    retry: 2,
    onSuccess: (saved: SavedOffer) => {
      queryClient.setQueryData(offerQueries.details(saved.id).queryKey, saved)
      hydratedIdRef.current = saved.id
      reset(getValues(), { keepValues: true })
    },
    onError: (error) => {
      console.error("Autosaving the offer failed:", error)
      toast.error("Nie udało się zapisać zmian.", { position: "top-center" })
    },
  })

  const { isDirty } = useFormState({ control })
  const { mutate: saveNow } = autoSave
  const watchedValues = useWatch({ control })

  // No timer at all while the form matches what was saved, so the reset that
  // follows a successful save cannot trigger another one.
  useEffect(() => {
    if (!offerId || !isDirty) {
      return
    }

    const timeoutId = window.setTimeout(
      () => saveNow(getValues()),
      AUTOSAVE_DEBOUNCE_MS,
    )

    return () => window.clearTimeout(timeoutId)
  }, [getValues, isDirty, offerId, saveNow, watchedValues])

  const missingComponent = offer?.missingComponent
  const errorMessage = missingComponent
    ? describeMissingComponent(missingComponent)
    : null
  const [dismissedMessage, setDismissedMessage] = useState<string | null>(null)
  const visibleErrorMessage =
    errorMessage && errorMessage !== dismissedMessage ? errorMessage : null

  return (
    <FormProvider {...form}>
      {visibleErrorMessage && (
        <PreviewErrorBanner
          message={visibleErrorMessage}
          onDismiss={() => setDismissedMessage(visibleErrorMessage)}
        />
      )}
      {children}
    </FormProvider>
  )
}
