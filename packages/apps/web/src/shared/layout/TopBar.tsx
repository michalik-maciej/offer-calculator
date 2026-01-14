import { Link } from "@tanstack/react-router"

type TopBarProps = {
  title?: string
}

export function TopBar({ title = "Senior Calculator" }: TopBarProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "12px 16px",
        borderBottom: "1px solid rgba(0,0,0,0.1)",
      }}
    >
      <strong>{title}</strong>
      <nav style={{ display: "flex", gap: 12 }} aria-label="Primary">
        <Link to="/offer">Offer</Link>
        <Link to="/breakdown">Breakdown</Link>
        <Link to="/inventory">Inventory</Link>
      </nav>
    </header>
  )
}
