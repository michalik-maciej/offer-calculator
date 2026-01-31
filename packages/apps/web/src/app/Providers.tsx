import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

import { Toaster } from "../core/ui/toaster"

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
