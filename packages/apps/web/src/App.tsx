import { BrowserRouter, Navigate, Route, Routes } from "react-router"

import { BreakdownRoute } from "./breakdown/breakdown"
import { InventoryRoute } from "./inventory/inventory"
import { AppLayout } from "./layout/AppLayout"
import { OfferRoute } from "./offer/offer"

export function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/offer" element={<OfferRoute />} />
          <Route path="/breakdown" element={<BreakdownRoute />} />
          <Route path="/inventory" element={<InventoryRoute />} />
          <Route path="*" element={<Navigate to="/offer" replace />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  )
}
