import { useQuery } from "@tanstack/react-query"

import { authQueries } from "../auth.api"

export function useIsAdmin(): boolean {
  const { data } = useQuery(authQueries.user())

  return data?.user.role === "ADMIN"
}
