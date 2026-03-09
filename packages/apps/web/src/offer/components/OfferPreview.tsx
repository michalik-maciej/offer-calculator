import { useFormContext } from "react-hook-form"

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../core/ui/drawer"

export const OfferPreview = () => {
  const formContext = useFormContext()
  console.log("Preview data:")

  return (
    <Drawer direction="right">
      <DrawerTrigger className="px-4 py-2 bg-blue-500 text-white rounded-md">
        Open Preview
      </DrawerTrigger>
      <DrawerContent className="h-max w-1/4">
        `{JSON.stringify(formContext.getValues())}`
      </DrawerContent>
    </Drawer>
  )
}
