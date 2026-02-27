import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

import { loginApi } from "../login.api"

export function useLogoutUser() {
  return useMutation({
    mutationFn: () => loginApi.logout(),
    onSuccess: async () => {
      toast.success("Pomyślnie wylogowano.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Error logging out:", error)
      toast.error("Nie udało się wylogować.", {
        position: "top-center",
      })
    },
  })
}
