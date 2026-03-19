import { useFormContext } from "react-hook-form"

import { Drawer, DrawerContent, DrawerTrigger } from "../../core/ui/drawer"

export const OfferPreview = () => {
  const formContext = useFormContext()

  return (
    <Drawer direction="right">
      <DrawerTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Open Preview
      </DrawerTrigger>
      <DrawerContent>
        <div className="min-h-full m-8 h-max">
          {JSON.stringify(formContext.getValues())}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
