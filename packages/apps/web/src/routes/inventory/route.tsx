import { createFileRoute, Outlet } from "@tanstack/react-router"

import { InventoryPage } from "../../inventory/components/InventoryPage"

export const Route = createFileRoute("/inventory")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <InventoryPage />
      <Outlet />
    </>
  )
}
