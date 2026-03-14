import { FolderOpen, Loader2 } from "lucide-react"
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { Button } from "../../core/ui/button"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../../core/ui/dialog"
import { offerQueries } from "../offer.api"

export const OfferList = () => {
  const [isOpen, setIsisOpen] = useState(false)
  const { data, isPending } = useQuery({
    ...offerQueries.list(),
    enabled: isOpen,
  })

  return (
    <Dialog open={isOpen} onOpenChange={setIsisOpen}>
      <DialogTrigger>
        <Button className="mx-6">
          Oferty
          <FolderOpen />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Katalog ofert</DialogTitle>
        {!isPending && <Loader2 className="animate-spin" />}
        {!isPending && (
          <ul className="grid gap-4 py-4 min-h-100">
            {data?.length === 0 && <p>Brak ofert</p>}
            {data?.map((offer) => (
              <li
                key={offer.title}
                className="flex items-center space-between gap-2"
              >
                <FolderOpen />
                {offer.title}
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  )
}
