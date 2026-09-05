import type { QueryClient } from "@tanstack/react-query"
import { createRootRouteWithContext, Outlet } from "@tanstack/react-router"
import { TanStackRouterDevtools } from "@tanstack/router-devtools"

import { AppLayout } from "../layout/AppLayout"
import { OfferFormProvider } from "../offer/components/OfferFormProvider"

type RouterContext = {
  queryClient: QueryClient
}

export type OfferSearch = {
  offerId?: string
}

export const Route = createRootRouteWithContext<RouterContext>()({
  validateSearch: (search: Record<string, unknown>): OfferSearch => ({
    offerId: typeof search.offerId === "string" ? search.offerId : undefined,
  }),
  component: () => (
    <>
      <OfferFormProvider>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </OfferFormProvider>
      <TanStackRouterDevtools />
    </>
  ),
})
