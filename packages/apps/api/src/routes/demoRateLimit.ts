import { rateLimit, RateLimitRequestHandler } from "express-rate-limit"

const WINDOW_MS = 60 * 60 * 1000
const MAX_DEMO_SESSIONS = 10

export function createDemoRateLimit(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_DEMO_SESSIONS,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many demo sessions" },
  })
}
