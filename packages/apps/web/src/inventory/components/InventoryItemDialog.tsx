import { InventoryItemForm } from "./InventoryItemForm"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"

export function InventoryItemDialog({
  isOpen,
  onOpenChange,
}: {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory to keep track of your stock.
          </DialogDescription>
        </DialogHeader>
        <InventoryItemForm onSubmit={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}
