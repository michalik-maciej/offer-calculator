import { Link } from "react-router"

import { Button } from "../shared/ui/button"

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-b-slate-600 bg-slate-200 px-4 py-3">
      <nav className="flex gap-3" aria-label="Primary">
        <Button variant="outline" asChild>
          <Link to="/offer">Oferta</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/breakdown">Rozpiska</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/inventory">Katalog</Link>
        </Button>
      </nav>
    </header>
  )
}
