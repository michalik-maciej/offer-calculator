import { useEffect, useState } from "react"

type Theme = "light" | "dark"

export function useTheme() {
  const getInitialTheme = (): Theme => {
    const stored = localStorage.getItem("theme") as Theme | null
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches
    return stored ?? (prefersDark ? "dark" : "light")
  }

  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark")
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark"
      document.documentElement.classList.toggle("dark", next === "dark")
      localStorage.setItem("theme", next)
      return next
    })
  }

  return { theme, toggleTheme }
}
