import { createFileRoute } from "@tanstack/react-router"

import { BreakdownRoute } from "../breakdown/breakdown"

export const Route = createFileRoute("/breakdown")({
  component: BreakdownRoute,
})
