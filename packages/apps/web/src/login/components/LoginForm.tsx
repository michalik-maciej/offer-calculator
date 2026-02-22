import { useCreateUser } from "../hooks/useCreateUser"

export const LoginForm = () => {
  const { mutate } = useCreateUser()

  return (
    <div className="flex h-full w-full items-center justify-center">
      <h1 className="text-2xl font-bold">Login</h1>
      <button
        onClick={() => mutate({ email: "test@test.com", password: "test" })}
      >
        Create
      </button>
    </div>
  )
}
