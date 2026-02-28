import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { ApiError } from "../core/createMethod.api"
import { authQueries } from "../user/auth.api"

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    try {
      const { user } = await queryClient.ensureQueryData(authQueries.user())
      if (user) {
        throw redirect({ to: "/offer" })
      }
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        throw redirect({ to: "/login" })
      }
      throw error
    }
  },
  component: Outlet,
})
