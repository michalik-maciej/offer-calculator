import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

import { Button } from "@/core/ui/button"

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
    <section className="m-4">
      <h1 className="mb-6">Katalog części</h1>
      <Button className="mb-4" asChild>
        <Link to="/inventory/new">Dodaj</Link>
      </Button>
      <Accordion type="single" collapsible className="max-w-lg">
        {data.map((group) => (
          <AccordionItem key={group.category} value={group.category}>
            <AccordionTrigger>{group.category}</AccordionTrigger>
            <AccordionContent>
              {group.items.map((item) => (
                <Link
                  key={item.id}
                  to="/inventory/$componentId"
                  params={{ componentId: item.id }}
                  className="block py-1"
                >
                  {item.label}
                </Link>
              ))}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
