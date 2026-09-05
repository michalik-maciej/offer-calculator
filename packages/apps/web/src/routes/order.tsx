import { BreakdownList } from "packages/apps/web/src/offer/components/BreakdownList"
import { useOffer } from "packages/apps/web/src/offer/hooks/useOffer"
import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute("/order")({
  component: OrderPage,
})

function OrderPage() {
  const { offer } = useOffer()

  return (
    <section className="flex max-w-2xl flex-col gap-4 p-8">
      <h1 className="text-xl font-semibold">Rozpiska</h1>

      {offer?.output ? (
        <>
          <p className="text-sm text-muted-foreground">{offer.title}</p>
          <BreakdownList breakdown={offer.output.breakdown} />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Nie ma jeszcze czego rozpisać. Zbuduj ofertę w Konfiguratorze, a
          rozpiska pojawi się tutaj.
        </p>
      )}
    </section>
  )
}
