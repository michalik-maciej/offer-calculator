import { useQuery } from "@tanstack/react-query"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../core/ui/accordion"
import { inventoryQueries } from "../api/inventory.api"

export function InventoryPage() {
  const { data, isPending, error } = useQuery(inventoryQueries.grouped())

  if (error) {
    return <div>Error loading inventory components.</div>
  }

  if (isPending) {
    return <div>Loading...</div>
  }

  return (
    <section>
      <h1>Inventory</h1>
      <Accordion type="single" collapsible className="max-w-lg">
        {data.map((group) => (
          <AccordionItem key={group.category} value={group.category}>
            <AccordionTrigger>{group.category}</AccordionTrigger>
            <AccordionContent>
              {group.items.map((item) => (
                <div key={item.id}>{item.label}</div>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
