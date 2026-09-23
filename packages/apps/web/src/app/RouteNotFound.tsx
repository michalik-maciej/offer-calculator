import { Link } from "@tanstack/react-router"

import { Button } from "../core/ui/button"

export function RouteNotFound() {
  return (
    <section className="flex flex-col items-start gap-3 p-8">
      <h1 className="text-xl font-semibold">Nie ma takiej strony</h1>
      <p className="text-sm text-muted-foreground">
        Adres, pod który trafiłeś, nie istnieje w tej aplikacji.
      </p>
      <Button asChild variant="outline">
        <Link search={true} to="/offer">
          Wróć do oferty
        </Link>
      </Button>
    </section>
  )
}
