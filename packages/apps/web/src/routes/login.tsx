import { createFileRoute, redirect } from "@tanstack/react-router"

import { authQueries } from "../user/auth.api"
import { LoginForm } from "../user/components/LoginForm"

export const Route = createFileRoute("/login")({
  loader: async ({ context }) => {
    try {
      const { user } = await context.queryClient.ensureQueryData(
        authQueries.user(),
      )
      if (user) {
        throw redirect({ to: "/" })
      }
    } catch (error) {
      console.error("Error checking auth status:", error)
    }
  },
  component: LoginForm,
})
