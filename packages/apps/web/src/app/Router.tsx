import { Navigate, Route, Routes } from "react-router"

import { BreakdownRoute } from "../breakdown/breakdown"
import { InventoryPage } from "../inventory/components/InventoryPage"
import { OfferRoute } from "../offer/offer"

export const Router = () => {
  return (
    <Routes>
      <Route path="/offer" element={<OfferRoute />} />
      <Route path="/breakdown" element={<BreakdownRoute />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="*" element={<Navigate to="/offer" replace />} />
    </Routes>
  )
}
