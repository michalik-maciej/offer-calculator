// src/components/theme-toggle.tsx
import { LogOut, Moon, Sun } from "lucide-react"
import { useLogoutUser } from "packages/apps/web/src/login/hooks/useLogoutUser"
import { Link } from "@tanstack/react-router"

import { useTheme } from "../core/hooks/useTheme"
import { Button } from "../core/ui/button"

function UserButton() {
  const { mutate: logout } = useLogoutUser()
  return (
    <Button
      size="icon"
      variant="outline"
      className="rounded-xl"
      onClick={() => logout()}
    >
      <LogOut className="h-5 w-5" />
    </Button>
  )
}

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
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <UserButton />
        </div>
      </nav>
    </header>
  )
}
