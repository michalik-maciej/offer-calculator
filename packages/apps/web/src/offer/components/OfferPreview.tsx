import { useFormContext } from "react-hook-form"

import { isLayoutWall } from "@/schemas/LayoutWall.schema"
import { OfferInput } from "@/schemas/Offer.schema"

import { LayoutEditor } from "./editor/LayoutEditor"
import { Drawer, DrawerContent, DrawerTrigger } from "../../core/ui/drawer"

export const OfferPreview = () => {
  const formContext = useFormContext<OfferInput>()
  const layout = formContext.getValues("layouts")[0]

  return (
    <Drawer direction="right">
      <DrawerTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Podgląd
      </DrawerTrigger>
      <DrawerContent className="p-6">
        {isLayoutWall(layout) && (
          <LayoutEditor defaultValues={layout} indexOfLayout={0} />
        )}
      </DrawerContent>
    </Drawer>
  )
}
