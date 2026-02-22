import { LoginInput, LoginInputSchema } from "@/schemas/auth/Login.schema"

import { apiType, createApiMethod } from "../core/createMethod.api"

const apiUrl = import.meta.env.VITE_APP_API_URL_LOCAL

if (!apiUrl) {
  throw new Error("Missing VITE_API_URL (set it in packages/apps/web/.env)")
}

export const loginApi = {
  login: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/login`,
    response: LoginInputSchema,
    data: apiType<LoginInput>(),
  }),
  register: createApiMethod({
    method: "POST",
    path: `${apiUrl}/auth/register`,
    response: LoginInputSchema,
    data: apiType<LoginInput>(),
  }),
}
