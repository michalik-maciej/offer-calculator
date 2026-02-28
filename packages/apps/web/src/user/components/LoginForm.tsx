import { Loader2, UserPen } from "lucide-react"
import { useForm } from "react-hook-form"

import { Button } from "../../core/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../core/ui/dialog"
import { Input } from "../../core/ui/input"
import { Label } from "../../core/ui/label"
import { useLoginUser } from "../hooks/useLoginUser"

export const LoginForm = () => {
  const { mutate: login, isPending } = useLoginUser()
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-sm flex flex-col justify-center items-center rounded-md border p-8 shadow-indigo-900 shadow-md"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="p-2 text-foreground/80">
            Zaloguj się, aby kalkulować
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col w-54"
          onSubmit={form.handleSubmit((values) => login(values))}
        >
          <div className="mt-2 flex flex-col gap-2">
            <Label className="text-foreground/60 text-xs" htmlFor="email">
              Email
            </Label>
            <Input id="email" {...form.register("email")} />
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <Label className="text-foreground/60 text-xs" htmlFor="password">
              Hasło
            </Label>
            <Input
              id="password"
              type="password"
              {...form.register("password")}
            />
          </div>
          <Button
            className="self-end mt-8"
            onClick={() => login(form.getValues())}
            disabled={isPending}
          >
            Zaloguj
            {isPending ? <Loader2 className="animate-spin" /> : <UserPen />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
