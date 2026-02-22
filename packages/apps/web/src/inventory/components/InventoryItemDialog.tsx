import { useQuery } from "@tanstack/react-query"

import { InventoryItem } from "./InventoryItem"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { inventoryQueries } from "../inventory.api"

export function InventoryItemDialog({
  componentId,
  onOpenChange,
}: {
  componentId?: string
  onOpenChange: (open: boolean) => void
}) {
  const { data, isPending } = useQuery({
    ...inventoryQueries.list(),
    enabled: !!componentId,
    select: (items) => items.find(({ id }) => id === componentId),
  })

  if (componentId && isPending) {
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
        <InventoryItem
          defaultValues={data ?? undefined}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
