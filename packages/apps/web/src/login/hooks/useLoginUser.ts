import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

import { LoginInput } from "@/schemas/auth/Login.schema"

import { loginApi } from "../login.api"

export function useLoginUser() {
  return useMutation({
    mutationFn: (data: LoginInput) => loginApi.login({ data }),
    onSuccess: async () => {
      toast.success("Pomyślnie zalogowano.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Error logging in:", error)
      toast.error("Nie udało się zalogować.", {
        position: "top-center",
      })
    },
  })
}
