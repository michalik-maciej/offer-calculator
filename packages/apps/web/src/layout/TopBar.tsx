import { Link } from "react-router"

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
        <Link to="/offer">Oferta</Link>
        <Link to="/breakdown">Rozpiska</Link>
        <Link to="/inventory">Katalog</Link>
      </nav>
    </header>
  )
}
