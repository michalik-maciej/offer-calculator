import type { PropsWithChildren } from "react"

import { TopBar } from "./TopBar"

type AppLayoutProps = PropsWithChildren<{
  title?: string
}>

export function AppLayout({ title, children }: AppLayoutProps) {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <TopBar title={title} />
      <main style={{ flex: 1, padding: 16 }}>{children}</main>
    </div>
  )
}
