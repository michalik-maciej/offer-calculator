import { useMutationState } from "@tanstack/react-query"

import { offerMutationKeys } from "../offer.api"

export function useAutoSaveState() {
  const statuses = useMutationState({
    filters: { mutationKey: offerMutationKeys.autoSave },
    select: (mutation) => mutation.state.status,
  })

  const latest = statuses.at(-1)

  return { hasFailed: latest === "error", isSaving: latest === "pending" }
}
