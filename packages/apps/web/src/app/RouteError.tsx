import { Link } from "@tanstack/react-router"

import { Button } from "../core/ui/button"

export function RouteError({ error }: { error?: Error }) {
  return (
    <section className="flex flex-col items-start gap-3 p-8">
      <h1 className="text-xl font-semibold">Coś poszło nie tak</h1>
      <p className="text-sm text-muted-foreground">
        Nie udało się wczytać tego widoku. Odśwież stronę albo wróć do oferty.
      </p>
      {error?.message && (
        <p className="text-xs text-destructive">{error.message}</p>
      )}
      <Button asChild variant="outline">
        <Link search={true} to="/offer">
          Wróć do oferty
        </Link>
      </Button>
    </section>
  )
}
