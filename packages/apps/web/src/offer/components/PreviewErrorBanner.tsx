import { SearchAlert, X } from "lucide-react"
import { createPortal } from "react-dom"
import { Link } from "@tanstack/react-router"

import { Button } from "../../core/ui/button"

export function PreviewErrorBanner({
  message,
  onDismiss,
}: {
  message: string
  onDismiss: () => void
}) {
  return createPortal(
    <div
      className="pointer-events-auto fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-4 border-2 border-destructive bg-card px-6 py-3 shadow-lg"
      onPointerDown={(event) => event.stopPropagation()}
      role="alert"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <p className="flex items-center gap-2 text-sm text-destructive">
          <SearchAlert />
          {message}
        </p>
        <Button asChild size="sm" variant="secondary">
          <Link search={true} to="/inventory/new">
            Dodaj
          </Link>
        </Button>
      </div>
      <Button
        aria-label="Zamknij komunikat"
        className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
        onClick={onDismiss}
        size="icon"
        type="button"
        variant="ghost"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>,
    document.body,
  )
}
