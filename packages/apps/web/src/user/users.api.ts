import { UserListResponseSchema } from "@/schemas/user/User.schema"
import { UserPasswordUpdateInput } from "@/schemas/user/UserPasswordUpdate.schema"

import { apiType, createApiMethod } from "../core/createMethod.api"

const apiUrl = import.meta.env.VITE_API_URL

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL")
}

export const usersApi = {
  list: createApiMethod({
    method: "GET",
    path: `${apiUrl}/users`,
    response: UserListResponseSchema,
  }),

  delete: createApiMethod({
    method: "DELETE",
    path: `${apiUrl}/users/:id`,
  }),

  setPassword: createApiMethod({
    method: "PUT",
    path: `${apiUrl}/users/:id/password`,
    data: apiType<UserPasswordUpdateInput>(),
  }),
}

export const usersQueries = {
  list: () => ({
    queryKey: ["users", "list"] as const,
    queryFn: () => usersApi.list(),
  }),
}
