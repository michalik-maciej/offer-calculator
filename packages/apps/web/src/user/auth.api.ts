import { AuthUserResponseSchema } from "@/schemas/auth/AuthUser.schema"
import { LoginInput, LoginResponseSchema } from "@/schemas/auth/Login.schema"

import { apiType, createApiMethod } from "../core/createMethod.api"

const apiUrl = import.meta.env.VITE_APP_API_URL

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL (set it in packages/apps/web/.env)")
}

export const authApi = {
  login: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/login`,
    response: LoginResponseSchema,
    data: apiType<LoginInput>(),
  }),
  logout: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/logout`,
  }),
  user: createApiMethod({
    method: "GET",
    path: `${apiUrl}/auth/user`,
    response: AuthUserResponseSchema,
  }),
}

export const authQueries = {
  user: () => ({
    queryKey: ["auth", "user"] as const,
    queryFn: () => authApi.user(),
  }),
}
