// src/components/theme-toggle.tsx
import { Moon, Sun } from "lucide-react"
import { Link } from "@tanstack/react-router"

import { useTheme } from "../core/hooks/useTheme"
import { Button } from "../core/ui/button"

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button
      variant="outline"
      className="rounded-full"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </Button>
  )
}

export function TopBar() {
  return (
    <header className="flex items-center justify-between gap-4 border-b px-4 py-3">
      <nav className="flex justify-between w-full" aria-label="Primary">
        <div className="flex gap-4">
          <Button variant="outline" asChild>
            <Link to="/offer">Oferta</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/breakdown">Rozpiska</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/inventory">Katalog</Link>
          </Button>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}
