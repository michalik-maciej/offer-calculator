import { createFileRoute } from "@tanstack/react-router"

import { InventoryItemDialog } from "../../inventory/components/InventoryItemDialog"

export const Route = createFileRoute("/inventory/$componentId")({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = Route.useNavigate()

  return <InventoryItemDialog onOpenChange={() => navigate({ to: ".." })} />
}
