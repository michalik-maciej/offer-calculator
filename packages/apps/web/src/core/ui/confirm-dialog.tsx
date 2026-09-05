import { Button } from "./button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./dialog"

export function ConfirmDialog({
  confirmLabel,
  description,
  isPending = false,
  onConfirm,
  onOpenChange,
  open,
  title,
}: {
  confirmLabel: string
  description: string
  isPending?: boolean
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
  open: boolean
  title: string
}) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
        <div className="flex justify-end gap-2">
          <Button
            onClick={() => onOpenChange(false)}
            type="button"
            variant="outline"
          >
            Anuluj
          </Button>
          <Button disabled={isPending} onClick={onConfirm} type="button">
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
