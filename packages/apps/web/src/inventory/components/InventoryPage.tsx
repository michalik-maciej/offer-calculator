import { CopyPlusIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../core/ui/accordion"
import { Button } from "../../core/ui/button"
import { inventoryQueries } from "../api/inventory.api"
import { CATEGORY_LABELS } from "../components/labels.inventory"

export function InventoryPage() {
  const { data, isPending, error } = useQuery({
    ...inventoryQueries.list(),
    select: (components) =>
      components.reduce<Record<string, typeof components>>((acc, component) => {
        acc[component.category] ??= []
        acc[component.category]?.push(component)
        return acc
      }, {}),
  })

  if (error) {
    return <div>Error loading inventory components.</div>
  }

  if (isPending) {
    return <div>Loading...</div>
  }

  return (
    <section className="m-8 w-md">
      <div className="flex items-center justify-between mb-6">
        <h1>Katalog części</h1>
        <Button variant="secondary" size="sm" asChild>
          <Link to="/inventory/new">
            <CopyPlusIcon />
            Dodaj
          </Link>
        </Button>
      </div>
      <Accordion type="single" collapsible className="max-w-lg">
        {Object.entries(data).map(([category, items]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger>
              {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
            </AccordionTrigger>
            <AccordionContent>
              {items.map((item) => (
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
