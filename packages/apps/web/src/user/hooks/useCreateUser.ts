import { toast } from "sonner"
import { useMutation, useQueryClient } from "@tanstack/react-query"

import type { LoginInput } from "@/schemas/auth/Login.schema"

import { authApi } from "../auth.api"
import { usersQueries } from "../users.api"

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LoginInput) => authApi.register({ data }),
    onSuccess: async () => {
      toast.success("Użytkownik został utworzony.", {
        position: "top-center",
      })
      await queryClient.invalidateQueries({
        queryKey: usersQueries.list().queryKey,
      })
    },
    onError: (error) => {
      console.error("Error creating user:", error)
      toast.error("Nie udało się utworzyć użytkownika.", {
        position: "top-center",
      })
    },
  })
}
