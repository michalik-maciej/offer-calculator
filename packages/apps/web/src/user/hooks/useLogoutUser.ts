import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"

import { authApi } from "../auth.api"

export function useLogoutUser() {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      toast.success("Pomyślnie wylogowano.", { position: "top-center" })
      navigate({ to: "/" })
    },
    onError: (error) => {
      console.error("Error logging out:", error)
      toast.error("Nie udało się wylogować.", {
        position: "top-center",
      })
    },
  })
}
