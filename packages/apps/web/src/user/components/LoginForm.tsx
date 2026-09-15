import { Loader2, PlayCircle, UserPen } from "lucide-react"
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
import { useDemoLogin } from "../hooks/useDemoLogin"
import { useLoginUser } from "../hooks/useLoginUser"

export const LoginForm = () => {
  const { mutate: login, isPending } = useLoginUser()
  const { mutate: openDemo, isPending: isDemoPending } = useDemoLogin()
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  })
  const { errors } = form.formState

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-sm flex flex-col justify-center items-center rounded-md border p-8 shadow-indigo-900 shadow-md before:pointer-events-none before:content-[''] before:absolute before:-left-4 before:top-6 before:bottom-6 before:w-0.75 before:rounded-full before:bg-indigo-700"
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
            <Input
              id="email"
              {...form.register("email", {
                required: "Podaj adres e-mail",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "To nie wygląda na adres e-mail",
                },
              })}
            />
            {errors.email?.message && (
              <span className="text-xs text-destructive">
                {errors.email.message}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <Label className="text-foreground/60 text-xs" htmlFor="password">
              Hasło
            </Label>
            <Input
              id="password"
              type="password"
              {...form.register("password", {
                required: "Podaj hasło",
                minLength: {
                  value: 8,
                  message: "Hasło ma co najmniej 8 znaków",
                },
              })}
            />
            {errors.password?.message && (
              <span className="text-xs text-destructive">
                {errors.password.message}
              </span>
            )}
          </div>
          <Button className="self-end mt-8" disabled={isPending} type="submit">
            Zaloguj
            {isPending ? <Loader2 className="animate-spin" /> : <UserPen />}
          </Button>
        </form>
        <div className="mt-6 flex w-54 flex-col gap-2 border-t border-border pt-4">
          <Button
            disabled={isDemoPending}
            onClick={() => openDemo()}
            type="button"
            variant="secondary"
          >
            {isDemoPending ? (
              <Loader2 className="animate-spin" />
            ) : (
              <PlayCircle />
            )}
            Demo
          </Button>
          <p className="text-xs text-foreground/60">
            Wejście bez konta. Ograniczona funkcjonalność.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
