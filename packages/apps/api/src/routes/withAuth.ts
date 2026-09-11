import type { RequestHandler, Router as ExpressRouter } from "express"

import { requireAuth } from "../controllers/auth/requireAuth"

type Bind = (path: string, ...handlers: RequestHandler[]) => void

export type AuthRouter = {
  delete: Bind
  get: Bind
  post: Bind
  put: Bind
}

export function withAuth(router: ExpressRouter): AuthRouter {
  return {
    delete: (path, ...handlers) => {
      router.delete(path, requireAuth, ...handlers)
    },
    get: (path, ...handlers) => {
      router.get(path, requireAuth, ...handlers)
    },
    post: (path, ...handlers) => {
      router.post(path, requireAuth, ...handlers)
    },
    put: (path, ...handlers) => {
      router.put(path, requireAuth, ...handlers)
    },
  }
}
