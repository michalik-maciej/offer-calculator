import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

import { authQueries } from "../user/auth.api"

export const Route = createFileRoute("/")({
  loader: async ({ context: { queryClient } }) => {
    try {
      const { user } = await queryClient.ensureQueryData(authQueries.user())
      if (user) {
        throw redirect({ to: "/offer" })
      }
    } catch (error) {
      let is401 = false
      try {
        // @ts-expect-error xxx
        is401 = "message" in error && error.message.includes("Unauthorized")
      } catch {
        // ignore
      }
      if (is401) {
        throw redirect({ to: "/login" })
      }
      throw error
    }
  },
  component: Outlet,
})
