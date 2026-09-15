import { rateLimit, RateLimitRequestHandler } from "express-rate-limit"

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILED_ATTEMPTS = 10

export function createLoginRateLimit(): RateLimitRequestHandler {
  return rateLimit({
    windowMs: WINDOW_MS,
    limit: MAX_FAILED_ATTEMPTS,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Too many login attempts" },
  })
}
