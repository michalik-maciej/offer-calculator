import { Providers } from "./Providers"
import { Router } from "./Router"
import { AppLayout } from "../layout/AppLayout"

export function App() {
  return (
    <Providers>
      <AppLayout>
        <Router />
      </AppLayout>
    </Providers>
  )
}
