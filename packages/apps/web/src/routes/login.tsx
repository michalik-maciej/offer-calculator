import { createFileRoute, redirect } from "@tanstack/react-router"

import { ApiError } from "../core/createMethod.api"
import { authQueries } from "../user/auth.api"
import { LoginForm } from "../user/components/LoginForm"

export const Route = createFileRoute("/login")({
  loader: async ({ context: { queryClient } }) => {
    const user = await queryClient
      .ensureQueryData(authQueries.user())
      .then((data) => data.user)
      .catch((error: unknown) => {
        const isSignedOut = error instanceof ApiError && error.status === 401
        if (!isSignedOut) {
          console.error("Error checking auth status:", error)
        }
        return null
      })

    if (user) {
      throw redirect({ to: "/" })
    }
  },
  component: LoginForm,
})
