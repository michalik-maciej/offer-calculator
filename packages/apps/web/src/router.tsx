import {
  createRootRoute,
  createRoute,
  createRouter,
  Link,
  Outlet,
} from "@tanstack/react-router"

import { AppLayout } from "./shared/layout/AppLayout"
import BreakdownRoute from "./routes/breakdown"
import InventoryRoute from "./routes/inventory"
import OfferRoute from "./routes/offer"

const rootRoute = createRootRoute({
  component: () => (
    <AppLayout>
      <Outlet />
    </AppLayout>
  ),
  notFoundComponent: () => (
    <section>
      <h1>Not Found</h1>
      <p>
        Go to <Link to="/offer">Offer</Link>.
      </p>
    </section>
  ),
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <section>
      <h1>Senior Calculator</h1>
      <p>
        Start at <Link to="/offer">Offer</Link>.
      </p>
    </section>
  ),
})

const offerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "offer",
  component: OfferRoute,
})

const breakdownRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "breakdown",
  component: BreakdownRoute,
})

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "inventory",
  component: InventoryRoute,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  offerRoute,
  breakdownRoute,
  inventoryRoute,
])

export const router = createRouter({
  routeTree,
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
