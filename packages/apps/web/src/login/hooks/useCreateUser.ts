import { toast } from "sonner"
import { useMutation } from "@tanstack/react-query"

import { LoginInput } from "@/schemas/auth/Login.schema"

import { loginApi } from "../login.api"

export function useCreateUser() {
  return useMutation({
    mutationFn: (data: LoginInput) => {
      console.log(data)
      return loginApi.register({ data })
    },
    onSuccess: async () => {
      toast.success("Użytkownik został utworzony.", { position: "top-center" })
    },
    onError: (error) => {
      console.error("Error creating user:", error)
      toast.error("Nie udało się utworzyć użytkownika.", {
        position: "top-center",
      })
    },
  })
}
