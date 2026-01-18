import { useQuery } from "@tanstack/react-query"

import { InventoryItemForm } from "./InventoryItemForm"
import { inventoryQueries } from "../api/inventory.api"

export function InventoryPage() {
  const { data, isPending, error } = useQuery(inventoryQueries.list())

  if (error) {
    return <div>Error loading inventory components.</div>
  }

  if (isPending) {
    return <div>Loading...</div>
  }

  return (
    <section>
      <h1>Inventory</h1>
      <InventoryItemForm
        defaultValues={data[0]}
        onSubmit={() => console.log("submitted")}
      />
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </section>
  )
}
