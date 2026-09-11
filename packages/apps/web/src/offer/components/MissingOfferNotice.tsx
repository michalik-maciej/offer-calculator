import { useNavigate } from "@tanstack/react-router"

import { Button } from "../../core/ui/button"

export function MissingOfferNotice() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-destructive">
        Ta oferta nie istnieje albo nie masz do niej dostępu.
      </p>
      <Button
        onClick={() => navigate({ search: {}, to: "." })}
        type="button"
        variant="outline"
      >
        Zamknij ofertę
      </Button>
    </div>
  )
}
