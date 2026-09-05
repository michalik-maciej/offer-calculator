import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { useOffer } from "./useOffer"
import { offerApi } from "../offer.api"

export function useDeleteOffer() {
  const { offerId } = useOffer()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => {
      if (!offerId) {
        throw new Error("Nothing to delete: no offer is open")
      }
      return offerApi.delete({ params: { id: offerId } })
    },
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["offer", "details"] })
      queryClient.invalidateQueries({ queryKey: ["offer", "list"] })
      navigate({ search: {}, to: "." })
      toast.success("Oferta usunięta.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Deleting the offer failed:", error)
      toast.error("Nie udało się usunąć oferty.", { position: "top-center" })
    },
  })
}
