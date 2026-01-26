import { createFileRoute } from "@tanstack/react-router"

import { InventoryItemDialog } from "../../inventory/components/InventoryItemDialog"

export const Route = createFileRoute("/inventory/$componentId")({
  component: RouteComponent,
})

function RouteComponent() {
  return <InventoryItemDialog isOpen={true} onOpenChange={() => {}} />
}
