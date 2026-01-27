import { useQuery } from "@tanstack/react-query"
import { useParams } from "@tanstack/react-router"

import { inventoryQueries } from "@/inventory/api/inventory.api"

import { InventoryItemForm } from "./InventoryItemForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"

export function InventoryItemDialog({
  onOpenChange,
}: {
  onOpenChange: (open: boolean) => void
}) {
  const { componentId } = useParams({ from: "/inventory/$componentId" })
  const { data, isPending } = useQuery({
    ...inventoryQueries.list(),
    select: (items) => items.find(({ id }) => id === componentId),
  })

  if (isPending) {
    return null
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="p-2 text-foreground/60">
            Edycja elementu
          </DialogTitle>
        </DialogHeader>
        <InventoryItemForm
          defaultValues={data ?? undefined}
          onSubmit={() => onOpenChange(false)}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
